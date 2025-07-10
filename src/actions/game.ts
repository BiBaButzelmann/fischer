"use server";

import { auth as betterAuth } from "@/auth";
import { auth, authWithRedirect } from "@/auth/utils";
import { db } from "@/db/client";
import { isUserParticipantInGame } from "@/db/repositories/game";
import { getGroupsByTournamentId } from "@/db/repositories/group";
import { getTournamentById } from "@/db/repositories/tournament";
import { game } from "@/db/schema/game";
import { GameResult } from "@/db/types/game";
import { eq, InferInsertModel } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import invariant from "tiny-invariant";

const weekdayToIndex = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 0,
} as const;

function addDays(d: Date, days: number) {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return out;
}

/** first date ≥ `start` that falls on the wanted `weekday`              */
function firstMatchDate(start: Date, weekday: keyof typeof weekdayToIndex) {
  const wanted = weekdayToIndex[weekday];
  const d = new Date(start);
  while (d.getDay() !== wanted) d.setDate(d.getDate() + 1);
  return d;
}

export function bergerFide(n: number): Array<Array<[number, number]>> {
  if (n % 2) {
    throw new Error("n must be even (add a bye for odd n)");
  }

  const half = Math.floor(n / 2); // boards per round
  const circle = n - 1; // players 1 … n-1 live on the circle
  const rounds: Array<Array<[number, number]>> = [];

  for (let r = 1; r < n; r++) {
    // 1-based round counter
    // ---------- board 1 (always contains player n) ----------
    let board: Array<[number, number]>;
    let startWhite: number;

    if (r & 1) {
      // odd round
      const opp = Math.floor((r + 1) / 2); // 1,2,3,4,…
      board = [[opp, n]]; // n is Black
      startWhite = (opp % circle) + 1; // first White on the circle
    } else {
      // even round
      const opp = half + Math.floor(r / 2); // n/2+1, n/2+2,…
      board = [[n, opp]]; // n is White
      startWhite = ((half + Math.floor(r / 2)) % circle) + 1;
      if (startWhite === n) {
        // can never be player n
        startWhite = 1;
      }
    }

    // ---------- remaining boards ----------
    let wIdx = startWhite - 1; // 0-based index on circle
    let bIdx = (wIdx - 2 + circle) % circle; // "two steps behind" (with proper modulo)

    for (let i = 0; i < half - 1; i++) {
      const white = wIdx + 1;
      const black = bIdx + 1;
      board.push([white, black]);
      wIdx = (wIdx + 1) % circle; // walk clockwise
      bIdx = (bIdx - 1 + circle) % circle; // walk anti-clockwise (with proper modulo)
    }

    rounds.push(board);
  }

  return rounds;
}

/** Berger algorithm for round-robin tournaments */
function roundRobinPairs(n: number): Array<Array<[number, number]>> {
  const isOdd = n % 2 === 1;

  if (isOdd) {
    const extended = bergerFide(n + 1);
    return extended.map((round) =>
      round.filter(([white, black]) => white <= n && black <= n),
    );
  } else {
    return bergerFide(n);
  }
}

export async function removeScheduledGames(tournamentId: number) {
  await db.delete(game).where(eq(game.tournamentId, tournamentId));
}

// TODO: find out how to do transactions with drizzle and neon
export async function scheduleGames(tournamentId: number) {
  const tournament = await getTournamentById(tournamentId);
  invariant(tournament, `Tournament #${tournamentId} not found`);
  const startDate = tournament.startDate;

  const groups = await getGroupsByTournamentId(tournamentId);

  const scheduledGames: InferInsertModel<typeof game>[] = [];

  /* ──────────────────────────────────────────────────────────────── */
  /* ▶▶ pairing logic starts here                                     */
  /* ──────────────────────────────────────────────────────────────── */
  for (const group of groups) {
    // ignore groups with no declared match-day
    if (!group.matchDay) {
      console.warn(
        `Skipping group ${group.groupNumber} (id=${group.id}) – no matchDay set`,
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
