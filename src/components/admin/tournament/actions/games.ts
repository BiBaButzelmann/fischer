"use server";

import { db } from "@/db/client";
import { game } from "@/db/schema/game";
import { eq, InferInsertModel } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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

/** Berger “circle” algorithm – works for 3 … 16 players (and beyond)  */
function roundRobinPairs(n: number): Array<Array<[number, number]>> {
  const odd = n % 2 === 1;
  const players: number[] = Array.from(
    { length: odd ? n + 1 : n },
    (_, i) => i + 1,
  ); // +1 dummy for bye
  const rounds = odd ? n : n - 1;
  const result: Array<Array<[number, number]>> = [];

  for (let r = 0; r < rounds; r++) {
    const pairs: [number, number][] = [];
    for (let i = 0; i < players.length / 2; i++) {
      const white = players[i];
      const black = players[players.length - 1 - i];
      if (white <= n && black <= n) pairs.push([white, black]); // skip dummy
    }

    result.push(pairs);

    // rotate (keeping first element fixed)
    players.splice(1, 0, players.pop() as number);
  }
  return result;
}

export async function removeScheduledGames(tournamentId: number) {
  await db.delete(game).where(eq(game.tournamentId, tournamentId));
}

// TODO: find out how to do transactions with drizzle and neon
export async function scheduleGames(tournamentId: number) {
  // TODO: change tournamentId to be dynamic
  const tournament = await db.query.tournament.findFirst({
    where: (t, { eq }) => eq(t.id, 1),
  });
  if (!tournament) throw new Error("Tournament #1 not found");
  const startDate = tournament.startDate;

  const groups = await db.query.group.findMany({
    where: (g, { eq }) => eq(g.tournamentId, tournamentId),
    with: {
      participants: true,
    },
  });

  const scheduledGames: InferInsertModel<typeof game>[] = [];

  /* ──────────────────────────────────────────────────────────────── */
  /* ▶▶ pairing logic starts here                                     */
  /* ──────────────────────────────────────────────────────────────── */
  for (const group of groups) {
    // ignore groups with no declared match-day
    if (!group.matchDay) continue;

    // players that actually have a position inside this group
    const players = group.participants
      .filter((p) => p.groupPosition !== null && p.groupPosition !== undefined)
      .sort((a, b) => (a.groupPosition ?? 0) - (b.groupPosition ?? 0));

    const n = players.length;
    if (n < 2) continue; // nothing to schedule

    const pairings = roundRobinPairs(n); // array[round][pair] -> [white#, black#]
    const firstDate = firstMatchDate(startDate, group.matchDay);

    pairings.forEach((pairsInRound, roundIdx) => {
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
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });
    });
  }
  /* ──────────────────────────────────────────────────────────────── */
  /* ▶▶ pairing logic ends here                                       */
  /* ──────────────────────────────────────────────────────────────── */
  console.log("Scheduled games:");

  for (const g of scheduledGames) {
    // fetch player names via participant → profile
    const whiteParticipant = await db.query.participant.findFirst({
      where: (p, { eq }) => eq(p.id, g.whiteParticipantId),
      with: {
        profile: true,
      },
    });

    const blackParticipant = await db.query.participant.findFirst({
      where: (p, { eq }) => eq(p.id, g.blackParticipantId),
      with: {
        profile: true,
      },
    });

    // fetch group name
    const grp = await db.query.group.findFirst({
      where: (gr, { eq }) => eq(gr.id, g.groupId),
    });

    const whiteName =
      whiteParticipant?.profile?.lastName ?? `#${g.whiteParticipantId}`;
    const blackName =
      blackParticipant?.profile?.lastName ?? `#${g.blackParticipantId}`;
    const groupName = grp?.groupName ?? `Group ${g.groupId}`;

    console.log(
      `Round ${g.round}, Board ${g.boardNumber}, ${groupName}: ${whiteName} (White) vs ${blackName} (Black)`,
    );
    console.log(`→ Scheduled on: ${g.scheduled.toDateString()}`);
  }
  // if (scheduledGames.length) {
  //   await db.insert(game).values(scheduledGames);
  //   revalidatePath("/admin/tournament");
  // }
}
