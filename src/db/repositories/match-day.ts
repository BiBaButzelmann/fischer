import { db } from "../client";
import { matchday } from "../schema/matchday";
import { and, eq, isNotNull } from "drizzle-orm";
import type { MatchDay } from "../types/group";

export async function getRefereeIdByTournamentIdAndDayOfWeek(
  tournamentId: number,
  dayOfWeek: MatchDay,
): Promise<number | null> {
  const result = await db.query.matchday.findFirst({
    where: and(
      eq(matchday.tournamentId, tournamentId),
      eq(matchday.dayOfWeek, dayOfWeek),
      isNotNull(matchday.refereeId),
    ),
    columns: {
      refereeId: true,
    },
  });

  return result?.refereeId ?? null;
}
