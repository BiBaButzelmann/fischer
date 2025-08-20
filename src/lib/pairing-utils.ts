const weekdayToIndex = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 0,
} as const;

export function addDays(d: Date, days: number) {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return out;
}

/** first date ≥ `start` that falls on the wanted `weekday`              */
export function firstMatchDate(
  start: Date,
  weekday: keyof typeof weekdayToIndex,
) {
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

  for (let round = 1; round < n; round++) {
    // ---------- board 1 (always contains player n) ----------
    let board: Array<[number, number]>;
    let startWhite: number;

    if (round & 1) {
      // odd round
      const opp = Math.floor((round + 1) / 2); // 1,2,3,4,5 …
      board = [[opp, n]]; // n is Black
      startWhite = (opp % circle) + 1; // first White on the circle
    } else {
      // even round
      const opp = half + Math.floor(round / 2); // n/2+1, n/2+2,…
      board = [[n, opp]]; // n is White
      startWhite = ((half + Math.floor(round / 2)) % circle) + 1;
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

export function nextEvenNumber(n: number): number {
  return n + (n % 2);
}

export type WeekdayKey = keyof typeof weekdayToIndex;
