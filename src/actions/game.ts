"use server";

import { auth as betterAuth } from "@/auth";
import { auth, authWithRedirect } from "@/auth/utils";
import { db } from "@/db/client";
import { isUserParticipantInGame } from "@/db/repositories/game";
import { getGroupById } from "@/db/repositories/group";
import { getTournamentById } from "@/db/repositories/tournament";
import { game } from "@/db/schema/game";
import { GameResult } from "@/db/types/game";
import { and, eq, InferInsertModel } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import invariant from "tiny-invariant";
import { addDays, firstMatchDate, roundRobinPairs } from "@/lib/pairing-utils";
import { redirect } from "next/navigation";

export async function removeScheduledGamesForGroup(
  tournamentId: number,
  groupId: number,
) {
  const session = await authWithRedirect();
  if (session.user.role !== "admin") {
    redirect("/willkommen");
  }

  await db
    .delete(game)
    .where(and(eq(game.tournamentId, tournamentId), eq(game.groupId, groupId)));
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
  if (group.matchDay == null) {
    return { error: `${group.groupName} hat keinen Spieltag gesetzt` };
  }

  const scheduledGames: InferInsertModel<typeof game>[] = [];
  const players = group.participants
    .filter((p) => p.groupPosition !== null && p.groupPosition !== undefined)
    .sort((a, b) => (a.groupPosition ?? 0) - (b.groupPosition ?? 0));

  const n = players.length;
  if (n < 2) {
    return {
      error: `${group.groupName} hat nicht genug Spieler für Paarungen`,
    };
  }

  const pairings = roundRobinPairs(n); // array[round][pair] -> [white#, black#]
  const firstDate = firstMatchDate(tournament.startDate, group.matchDay);

  pairings.forEach((pairsInRound, roundIdx) => {
    // TODO: set the time from the tournament settings
    const roundDate = addDays(firstDate, roundIdx * 7); // weekly cadence
    pairsInRound.forEach(([whiteNo, blackNo], boardIdx) => {
      scheduledGames.push({
        whiteParticipantId: players[whiteNo - 1].id,
        blackParticipantId: players[blackNo - 1].id,
        tournamentId,
        groupId: group.id,
        round: roundIdx + 1,
        boardNumber: boardIdx + 1,
        scheduled: roundDate,
      });
    });
  });

  await db.insert(game).values(scheduledGames);
  revalidatePath("/admin/paarungen");
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
