"use server";

import { auth as betterAuth } from "@/auth";
import { auth, authWithRedirect } from "@/auth/utils";
import { db } from "@/db/client";
import { isUserParticipantInGame } from "@/db/repositories/game";
import { getGroupById } from "@/db/repositories/group";
import { getTournamentById } from "@/db/repositories/tournament";
import { game } from "@/db/schema/game";
import { matchday, matchdayGame } from "@/db/schema/matchday";
import { profile } from "@/db/schema/profile";
import { GameResult } from "@/db/types/game";
import { and, eq, InferInsertModel, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import invariant from "tiny-invariant";
import { roundRobinPairs } from "@/lib/pairing-utils";
import { redirect } from "next/navigation";
import { updateGamePostponement } from "@/db/repositories/game-postponement";
import { GAME_START_TIME } from "@/constants/constants";

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

      const pairsInRound = pairings[roundIdx];
      for (let boardIdx = 0; boardIdx < pairsInRound.length; boardIdx++) {
        matchdayGameRelations.push({
          matchdayId: matchday!.id,
          gameId: insertedGames[gameIndex].id,
        });
        gameIndex++;
      }
    }

    await tx.insert(matchdayGame).values(matchdayGameRelations);
  });

  revalidatePath("/admin/paarungen");
}

export async function updateGameMatchday(
  gameId: number,
  newMatchdayId: number,
) {
  const session = await authWithRedirect();

  const gameExists = await db.query.game.findFirst({
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

  invariant(gameExists, "Game not found");

  const isUserInGame =
    gameExists.whiteParticipant.profile.userId === session.user.id ||
    gameExists.blackParticipant.profile.userId === session.user.id;

  invariant(
    isUserInGame || session.user.role === "admin",
    "Unauthorized to move this game",
  );

  const currentMatchday = gameExists.matchdayGame?.matchday;
  const newMatchday = await db.query.matchday.findFirst({
    where: eq(matchday.id, newMatchdayId),
  });

  invariant(currentMatchday, "Current matchday not found");
  invariant(newMatchday, "New matchday not found");

  const postponingParticipant =
    gameExists.whiteParticipant.profile.userId === session.user.id
      ? gameExists.whiteParticipant
      : gameExists.blackParticipant;

  const userProfile = await db.query.profile.findFirst({
    where: eq(profile.userId, session.user.id),
  });

  invariant(userProfile, "User profile not found");

  const createGameTimestamp = (date: Date) => {
    const timestamp = new Date(date);
    timestamp.setHours(
      GAME_START_TIME.hours,
      GAME_START_TIME.minutes,
      GAME_START_TIME.seconds,
      0,
    );
    return timestamp;
  };

  const fromTimestamp = createGameTimestamp(currentMatchday.date);
  const toTimestamp = createGameTimestamp(newMatchday.date);

  await updateGamePostponement(
    gameId,
    postponingParticipant.id,
    userProfile.id,
    fromTimestamp,
    toTimestamp,
  );

  await db.transaction(async (tx) => {
    await tx
      .update(matchdayGame)
      .set({ matchdayId: newMatchdayId })
      .where(eq(matchdayGame.gameId, gameId));
  });

  revalidatePath("/kalender");
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
  // TODO: check match entering helper as well
  const isUserParticipating = await isUserParticipantInGame(
    gameId,
    session.user.id,
  );
  invariant(isUserParticipating, "User is not participating in this game");

  await db
    .update(game)
    .set({
      result,
    })
    .where(eq(game.id, gameId));
  revalidatePath("/partien");
  revalidatePath(`/partien/${gameId}`);
}
