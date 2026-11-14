"use server";

import { authWithRedirect } from "@/auth/utils";
import { db } from "@/db/client";
import { isUserParticipantInGame } from "@/db/repositories/game";
import { getGroupById } from "@/db/repositories/group";
import { getTournamentById } from "@/db/repositories/tournament";
import { game } from "@/db/schema/game";
import { gamePostponement } from "@/db/schema/gamePostponement";
import { matchday, matchdayGame } from "@/db/schema/matchday";
import { profile } from "@/db/schema/profile";
import { GameContacts, GameResult } from "@/db/types/game";
import { and, eq, InferInsertModel, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import invariant from "tiny-invariant";
import { bergerFide, nextEvenNumber } from "@/lib/pairing-utils";
import { redirect } from "next/navigation";
import {
  formatGameTimeByTournament,
  getDateTimeFromTournamentTime,
  hasGameStarted,
} from "@/lib/game-time";
import { sendGamePostponementEmails } from "@/actions/email/game-postponement";
import { updateBoardNumbers } from "@/actions/board-number";
import { formatDateOnly } from "@/lib/date";
import { action, ActionError } from "@/lib/actions";
import { getRolesByUserIdAndTournamentId } from "@/db/repositories/role";

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

  const deactivatedPlayers = players.filter(
    (p) => p.participant.deletedAt != null,
  );
  if (deactivatedPlayers.length > 0) {
    const names = deactivatedPlayers
      .map(
        (p) =>
          `${p.participant.profile.firstName} ${p.participant.profile.lastName}`,
      )
      .join(", ");
    return {
      error: `Paarungen für ${group.groupName} nicht möglich: ${names} ${deactivatedPlayers.length === 1 ? "ist" : "sind"} deaktiviert. Entferne die Person aus der Gruppe oder stelle sie wieder her.`,
    };
  }

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

  const nextEvenPlayerCount = nextEvenNumber(n);
  const pairings = bergerFide(nextEvenPlayerCount); // array[round][pair] -> [white#, black#]

  if (pairings.length > regularWeeks.length) {
    return {
      error: `Nicht genug reguläre Wochen (${regularWeeks.length}) für alle Runden (${pairings.length}) in ${group.groupName}`,
    };
  }

  await db.transaction(async (tx) => {
    const gamesToInsert: InferInsertModel<typeof game>[] = [];
    const matchdayIdsByRound: number[] = [];

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
      matchdayIdsByRound[roundIdx] = matchday.id;
      let startingBoardNumber = 1;

      pairsInRound.forEach(([whiteNo, blackNo]) => {
        if (whiteNo > n || blackNo > n) return;

        const whitePlayer = players[whiteNo - 1];
        const blackPlayer = players[blackNo - 1];

        invariant(
          whitePlayer && blackPlayer,
          `Invalid pairing [${whiteNo}, ${blackNo}] in round ${roundIdx + 1}`,
        );

        gamesToInsert.push({
          whiteParticipantId: whitePlayer.participant.id,
          blackParticipantId: blackPlayer.participant.id,
          result: null,
          tournamentId,
          groupId: group.id,
          round: roundIdx + 1,
          boardNumber: startingBoardNumber++,
        });
      });
    }

    const insertedGames = await tx
      .insert(game)
      .values(gamesToInsert)
      .returning({ id: game.id, round: game.round });

    const matchdayGameRelations = insertedGames.map(({ id, round }) => ({
      matchdayId: matchdayIdsByRound[round - 1],
      gameId: id,
    }));

    await tx.insert(matchdayGame).values(matchdayGameRelations);
  });

  revalidatePath("/turniere/[slug]/admin/paarungen", "page");
}

export const updateGameMatchdayAndBoardNumber = action(
  async (gameId: number, newMatchdayId: number) => {
    const session = await authWithRedirect();

    const gameData = await db.query.game.findFirst({
      where: eq(game.id, gameId),
      with: {
        whiteParticipant: { with: { profile: true } },
        blackParticipant: { with: { profile: true } },
        tournament: {
          columns: {
            gameStartTime: true,
          },
        },
        matchdayGame: {
          with: {
            matchday: true,
          },
        },
      },
    });
    if (!gameData) {
      throw new ActionError("Partie nicht gefunden");
    }

    if (gameData.result !== null) {
      throw new ActionError(
        "Partie mit einem Ergebnis kann nicht mehr verschoben werden",
      );
    }

    invariant(gameData.whiteParticipant, "Weißer Spieler nicht gefunden");
    invariant(gameData.blackParticipant, "Schwarzer Spieler nicht gefunden");

    const isUserInGame =
      gameData.whiteParticipant.profile.userId === session.user.id ||
      gameData.blackParticipant.profile.userId === session.user.id;
    if (!isUserInGame && session.user.role !== "admin") {
      throw new ActionError(
        "Du bist nicht berechtigt, diese Partie zu verschieben",
      );
    }

    const currentMatchday = gameData.matchdayGame?.matchday;
    invariant(currentMatchday, "Aktueller Spieltag nicht gefunden");

    const newMatchday = await db.query.matchday.findFirst({
      where: eq(matchday.id, newMatchdayId),
    });
    if (!newMatchday) {
      throw new ActionError("Der gewählte Spieltag existiert nicht mehr");
    }

    const postponingParticipant =
      gameData.whiteParticipant.profile.userId === session.user.id
        ? gameData.whiteParticipant
        : gameData.blackParticipant;

    const userProfile = await db.query.profile.findFirst({
      where: eq(profile.userId, session.user.id),
    });
    invariant(userProfile, "Benutzerprofil nicht gefunden");

    const fromTimestamp = getDateTimeFromTournamentTime(
      currentMatchday.date,
      gameData.tournament.gameStartTime,
    );
    const toTimestamp = getDateTimeFromTournamentTime(
      newMatchday.date,
      gameData.tournament.gameStartTime,
    );

    await db.transaction(async (tx) => {
      await tx.insert(gamePostponement).values({
        gameId,
        postponingParticipantId: postponingParticipant.id,
        postponedByProfileId: userProfile.id,
        from: fromTimestamp.toJSDate(),
        to: toTimestamp.toJSDate(),
      });

      await tx
        .update(matchdayGame)
        .set({ matchdayId: newMatchdayId })
        .where(eq(matchdayGame.gameId, gameId));
    });

    await updateBoardNumbers(
      gameId,
      gameData.groupId,
      gameData.boardNumber,
      currentMatchday.id,
      newMatchdayId,
    );

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

    revalidatePath("/turniere/[slug]/kalender", "page");
    revalidatePath("/turniere/[slug]/partien", "page");
  },
);

export async function getGameContacts(gameId: number): Promise<GameContacts> {
  const session = await authWithRedirect();

  const gameData = await db.query.game.findFirst({
    where: eq(game.id, gameId),
    with: {
      whiteParticipant: {
        with: {
          profile: {
            columns: {
              userId: true,
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true,
            },
          },
        },
      },
      blackParticipant: {
        with: {
          profile: {
            columns: {
              userId: true,
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true,
            },
          },
        },
      },
    },
  });
  invariant(gameData, "Partie nicht gefunden");

  const isUserInGame =
    gameData.whiteParticipant?.profile.userId === session.user.id ||
    gameData.blackParticipant?.profile.userId === session.user.id;
  invariant(
    isUserInGame || session.user.role === "admin",
    "Nicht berechtigt, Kontaktdaten dieser Partie einzusehen",
  );

  const toContact = (participant: typeof gameData.whiteParticipant) =>
    participant
      ? {
          firstName: participant.profile.firstName,
          lastName: participant.profile.lastName,
          email: participant.profile.email,
          phoneNumber: participant.profile.phoneNumber,
        }
      : null;

  return {
    white: toContact(gameData.whiteParticipant),
    black: toContact(gameData.blackParticipant),
  };
}

export async function rescheduleGamesForGroup(
  tournamentId: number,
  groupId: number,
) {
  await removeScheduledGamesForGroup(tournamentId, groupId);
  return await scheduleGamesForGroup(tournamentId, groupId);
}

export const updateGameResult = action(
  async (gameId: number, result: GameResult | null) => {
    const session = await authWithRedirect();

    const gameData = await db.query.game.findFirst({
      where: eq(game.id, gameId),
      with: {
        tournament: {
          columns: {
            gameStartTime: true,
          },
        },
        matchdayGame: {
          with: {
            matchday: true,
          },
        },
      },
    });
    if (!gameData) {
      throw new ActionError("Partie nicht gefunden");
    }

    const isUserParticipating = await isUserParticipantInGame(
      gameId,
      session.user.id,
    );
    const userRoles = await getRolesByUserIdAndTournamentId(
      session.user.id,
      gameData.tournamentId,
    );
    const isAdmin = userRoles.includes("admin");
    const isReferee = userRoles.includes("referee");

    if (!isUserParticipating && !isAdmin && !isReferee) {
      throw new ActionError(
        "Du bist nicht berechtigt, das Ergebnis dieser Partie einzutragen",
      );
    }

    if (result === null && !isAdmin && !isReferee) {
      throw new ActionError(
        "Nur Admins und Schiedsrichter können ein Ergebnis zurücksetzen",
      );
    }

    const matchdayDate = gameData.matchdayGame.matchday.date;
    const { gameStartTime } = gameData.tournament;
    if (!hasGameStarted(matchdayDate, gameStartTime)) {
      throw new ActionError(
        `Das Ergebnis kann erst nach Partiebeginn am ${formatDateOnly(matchdayDate)} um ${formatGameTimeByTournament(gameStartTime)} eingetragen werden`,
      );
    }

    await db
      .update(game)
      .set({
        result,
      })
      .where(eq(game.id, gameId));
    revalidatePath("/turniere/[slug]/partien", "page");
    revalidatePath("/turniere/[slug]/partien/[partieId]", "page");
  },
);
