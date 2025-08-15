"use server";

import { auth as betterAuth } from "@/auth";
import { auth, authWithRedirect } from "@/auth/utils";
import { db } from "@/db/client";
import { isUserParticipantInGame } from "@/db/repositories/game";
import { getGroupById } from "@/db/repositories/group";
import { getTournamentById } from "@/db/repositories/tournament";
import { game } from "@/db/schema/game";
import { gamePostponement } from "@/db/schema/gamePostponement";
import { matchday, matchdayGame } from "@/db/schema/matchday";
import { profile } from "@/db/schema/profile";
import { GameResult } from "@/db/types/game";
import {
  and,
  eq,
  InferInsertModel,
  inArray,
  desc,
  sql,
  gt,
  exists,
} from "drizzle-orm";
import { revalidatePath } from "next/cache";
import invariant from "tiny-invariant";
import { roundRobinPairs } from "@/lib/pairing-utils";
import { redirect } from "next/navigation";
import { getDateTimeFromDefaultTime } from "@/lib/game-time";
import { sendGamePostponementEmails } from "@/actions/email/game-postponement";

async function getNextAvailableBoardNumber(
  matchdayId: number,
  groupId: number,
) {
  const gameWithHighestBoardNumber = await db
    .select({ boardNumber: game.boardNumber })
    .from(matchdayGame)
    .innerJoin(game, eq(matchdayGame.gameId, game.id))
    .where(
      and(eq(matchdayGame.matchdayId, matchdayId), eq(game.groupId, groupId)),
    )
    .orderBy(desc(game.boardNumber))
    .limit(1);

  const highestBoardNumber = gameWithHighestBoardNumber[0]?.boardNumber ?? 0;
  return highestBoardNumber + 1;
}

async function closeGapInBoardNumbers(
  matchdayId: number,
  groupId: number,
  removedBoardNumber: number,
) {
  await db
    .update(game)
    .set({ boardNumber: sql`${game.boardNumber} - 1` })
    .where(
      and(
        eq(game.groupId, groupId),
        gt(game.boardNumber, removedBoardNumber),
        exists(
          db
            .select()
            .from(matchdayGame)
            .where(
              and(
                eq(matchdayGame.gameId, game.id),
                eq(matchdayGame.matchdayId, matchdayId),
              ),
            ),
        ),
      ),
    );
}

export async function removeScheduledGamesForGroup(
  tournamentId: number,
  groupId: number,
) {
  const session = await authWithRedirect();
  if (session.user.role !== "admin") {
    redirect("/willkommen");
  }

  await db.transaction(async (tx) => {
    const gamesToDelete = await tx.query.game.findMany({
      where: (game, { eq, and }) =>
        and(eq(game.tournamentId, tournamentId), eq(game.groupId, groupId)),
      columns: { id: true },
    });

    const gameIds = gamesToDelete.map((g) => g.id);

    if (gameIds.length > 0) {
      await tx
        .delete(matchdayGame)
        .where(inArray(matchdayGame.gameId, gameIds));
    }

    await tx
      .delete(game)
      .where(
        and(eq(game.tournamentId, tournamentId), eq(game.groupId, groupId)),
      );
  });
}

export async function scheduleGamesForGroup(
  tournamentId: number,
  groupId: number,
) {
  const session = await authWithRedirect();
  if (session.user.role !== "admin") {
    redirect("/willkommen");
  }

  const tournament = await getTournamentById(tournamentId);
  if (tournament == null) {
    return { error: `Kein Turnier ${tournamentId} gefunden` };
  }

  const group = await getGroupById(groupId);
  if (group == null) {
    return { error: `Keine Gruppe ${groupId} gefunden` };
  }
  if (group.dayOfWeek == null) {
    return { error: `${group.groupName} hat keinen Spieltag gesetzt` };
  }

  const dayOfWeek = group.dayOfWeek;

  const players = group.participants
    .filter((p) => p.groupPosition !== null && p.groupPosition !== undefined)
    .sort((a, b) => (a.groupPosition ?? 0) - (b.groupPosition ?? 0));

  const n = players.length;
  if (n < 2) {
    return {
      error: `${group.groupName} hat nicht genug Spieler für Paarungen`,
    };
  }

  const regularWeeks = await db.query.tournamentWeek.findMany({
    where: (week, { eq, and }) =>
      and(eq(week.tournamentId, tournamentId), eq(week.status, "regular")),
    orderBy: (week, { asc }) => asc(week.weekNumber),
  });

  const pairings = roundRobinPairs(n); // array[round][pair] -> [white#, black#]

  if (pairings.length > regularWeeks.length) {
    return {
      error: `Nicht genug reguläre Wochen (${regularWeeks.length}) für alle Runden (${pairings.length}) in ${group.groupName}`,
    };
  }

  await db.transaction(async (tx) => {
    const gamesToInsert: InferInsertModel<typeof game>[] = [];
    const matchdayGameRelations: InferInsertModel<typeof matchdayGame>[] = [];

    const matchdays = await tx.query.matchday.findMany({
      where: (md, { eq, and }) =>
        and(
          eq(md.tournamentId, tournamentId),
          eq(md.dayOfWeek, dayOfWeek),
          inArray(
            md.tournamentWeekId,
            regularWeeks.map((w) => w.id),
          ),
        ),
    });

    for (let roundIdx = 0; roundIdx < pairings.length; roundIdx++) {
      const tournamentWeekForRound = regularWeeks[roundIdx];
      const matchday = matchdays.find(
        (m) => m.tournamentWeekId === tournamentWeekForRound.id,
      );

      if (!matchday) {
        return {
          error: `Kein Spieltag gefunden für Turnier ${tournamentId}, Woche ${tournamentWeekForRound.weekNumber}, ${dayOfWeek}`,
        };
      }

      const pairsInRound = pairings[roundIdx];
      pairsInRound.forEach(([whiteNo, blackNo], boardIdx) => {
        gamesToInsert.push({
          whiteParticipantId: players[whiteNo - 1].participant.id,
          blackParticipantId: players[blackNo - 1].participant.id,
          tournamentId,
          groupId: group.id,
          round: roundIdx + 1,
          boardNumber: boardIdx + 1,
        });
      });
    }

    const insertedGames = await tx
      .insert(game)
      .values(gamesToInsert)
      .returning({ id: game.id });

    let gameIndex = 0;
    for (let roundIdx = 0; roundIdx < pairings.length; roundIdx++) {
      const tournamentWeekForRound = regularWeeks[roundIdx];
      const matchday = matchdays.find(
        (m) => m.tournamentWeekId === tournamentWeekForRound.id,
      );

      if (!matchday) {
        return {
          error: `Kein Spieltag gefunden für Turnier ${tournamentId}, Woche ${tournamentWeekForRound.weekNumber}, ${dayOfWeek}`,
        };
      }

      const pairsInRound = pairings[roundIdx];
      for (let boardIdx = 0; boardIdx < pairsInRound.length; boardIdx++) {
        matchdayGameRelations.push({
          matchdayId: matchday.id,
          gameId: insertedGames[gameIndex].id,
        });
        gameIndex++;
      }
    }

    await tx.insert(matchdayGame).values(matchdayGameRelations);
  });

  revalidatePath("/admin/paarungen");
}

export async function updateGameMatchdayAndBoardNumber(
  gameId: number,
  newMatchdayId: number,
) {
  const session = await authWithRedirect();

  const gameData = await db.query.game.findFirst({
    where: eq(game.id, gameId),
    with: {
      whiteParticipant: { with: { profile: true } },
      blackParticipant: { with: { profile: true } },
      matchdayGame: {
        with: {
          matchday: true,
        },
      },
    },
  });
  invariant(gameData, "Game not found");

  const isUserInGame =
    gameData.whiteParticipant.profile.userId === session.user.id ||
    gameData.blackParticipant.profile.userId === session.user.id;
  invariant(
    isUserInGame || session.user.role === "admin",
    "Unauthorized to move this game",
  );

  const currentMatchday = gameData.matchdayGame?.matchday;
  invariant(currentMatchday, "Current matchday not found");

  const newMatchday = await db.query.matchday.findFirst({
    where: eq(matchday.id, newMatchdayId),
  });
  invariant(newMatchday, "New matchday not found");

  const postponingParticipant =
    gameData.whiteParticipant.profile.userId === session.user.id
      ? gameData.whiteParticipant
      : gameData.blackParticipant;

  const userProfile = await db.query.profile.findFirst({
    where: eq(profile.userId, session.user.id),
  });
  invariant(userProfile, "User profile not found");

  const fromTimestamp = getDateTimeFromDefaultTime(currentMatchday.date);
  const toTimestamp = getDateTimeFromDefaultTime(newMatchday.date);

  await db.transaction(async (tx) => {
    const currentBoardNumber = gameData.boardNumber;

    const newBoardNumber = await getNextAvailableBoardNumber(
      newMatchdayId,
      gameData.groupId,
    );

    await tx.insert(gamePostponement).values({
      gameId,
      postponingParticipantId: postponingParticipant.id,
      postponedByProfileId: userProfile.id,
      from: fromTimestamp,
      to: toTimestamp,
    });

    await tx
      .update(matchdayGame)
      .set({ matchdayId: newMatchdayId })
      .where(eq(matchdayGame.gameId, gameId));

    await tx
      .update(game)
      .set({ boardNumber: newBoardNumber })
      .where(eq(game.id, gameId));

    await closeGapInBoardNumbers(
      currentMatchday.id,
      gameData.groupId,
      currentBoardNumber,
    );
  });

  try {
    await sendGamePostponementEmails(
      gameData,
      postponingParticipant,
      currentMatchday,
      newMatchday,
    );
  } catch (emailError) {
    console.error(
      "Failed to send postponement email notifications:",
      emailError,
    );
  }

  revalidatePath("/kalender");
  revalidatePath("/partien");
}

export async function rescheduleGamesForGroup(
  tournamentId: number,
  groupId: number,
) {
  await removeScheduledGamesForGroup(tournamentId, groupId);
  return await scheduleGamesForGroup(tournamentId, groupId);
}

export async function verifyPgnPassword(gameId: number, password: string) {
  const session = await auth();
  if (!session) return false;

  const game = await db.query.game.findFirst({
    where: (game, { eq }) => eq(game.id, gameId),
    with: {
      tournament: true,
    },
  });
  if (!game || !game.tournament) return false;

  const context = await betterAuth.$context;
  return await context.password.verify({
    password,
    hash: game.tournament.pgnViewerPassword,
  });
}

export async function updateGameResult(gameId: number, result: GameResult) {
  const session = await authWithRedirect();
  const isUserParticipating = await isUserParticipantInGame(
    gameId,
    session.user.id,
  );
  invariant(
    isUserParticipating || session.user.role === "admin",
    "User is not participating in this game",
  );

  await db
    .update(game)
    .set({
      result,
    })
    .where(eq(game.id, gameId));
  revalidatePath("/partien");
  revalidatePath(`/partien/${gameId}`);
}
