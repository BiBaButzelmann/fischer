"use server";

import { auth as betterAuth } from "@/auth";
import { auth, authWithRedirect } from "@/auth/utils";
import { db } from "@/db/client";
import { isUserParticipantInGame } from "@/db/repositories/game";
import { getGroupsWithParticipantsByTournamentId } from "@/db/repositories/group";
import { getTournamentById } from "@/db/repositories/tournament";
import { game } from "@/db/schema/game";
import { GameResult } from "@/db/types/game";
import { eq, InferInsertModel } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import invariant from "tiny-invariant";
import { addDays, firstMatchDate, roundRobinPairs } from "@/lib/pairing-utils";

export async function removeScheduledGames(tournamentId: number) {
  await db.delete(game).where(eq(game.tournamentId, tournamentId));
}

export async function scheduleGames(tournamentId: number) {
  const tournament = await getTournamentById(tournamentId);
  invariant(tournament, `Tournament #${tournamentId} not found`);
  const startDate = tournament.startDate;

  const groups = await getGroupsWithParticipantsByTournamentId(tournamentId);

  const scheduledGames: InferInsertModel<typeof game>[] = [];

  /* ──────────────────────────────────────────────────────────────── */
  /* ▶▶ pairing logic starts here                                     */
  /* ──────────────────────────────────────────────────────────────── */
  for (const group of groups) {
    // ignore groups with no declared match-day
    if (!group.matchDay) {
      console.warn(
        `Skipping group ${group.groupNumber} (id=${group.id}) - no matchDay set`,
      );
      continue;
    }

    // players that actually have a position inside this group
    const players = group.participants
      .filter((p) => p.groupPosition !== null && p.groupPosition !== undefined)
      .sort((a, b) => (a.groupPosition ?? 0) - (b.groupPosition ?? 0));

    const n = players.length;
    if (n < 2) continue; // nothing to schedule

    const pairings = roundRobinPairs(n); // array[round][pair] -> [white#, black#]
    const firstDate = firstMatchDate(startDate, group.matchDay);

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
  }

  if (scheduledGames.length) {
    await db.insert(game).values(scheduledGames);
    revalidatePath("/admin/tournament");
  }
}

export async function rescheduleGames(tournamentId: number) {
  await removeScheduledGames(tournamentId);
  await scheduleGames(tournamentId);
  revalidatePath("/admin/tournament");
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
