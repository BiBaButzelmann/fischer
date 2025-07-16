import { db } from "../client";
import { matchday } from "../schema/matchday";
import { and, eq, isNotNull } from "drizzle-orm";
import type { availableMatchDays } from "../schema/columns.helpers";

export async function getRefereeIdByTournamentIdAndDayOfWeek(
  tournamentId: number,
  dayOfWeek: (typeof availableMatchDays)[number],
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
