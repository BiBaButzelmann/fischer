import { db } from "../client";
import { matchday } from "../schema/matchday";
import { referee } from "../schema/referee";
import { profile } from "../schema/profile";
import { and, eq, isNotNull, getTableColumns } from "drizzle-orm";
import type { RefereeWithName } from "../types/referee";
import { DayOfWeek } from "../types/group";

export async function getRefereeIdByTournamentIdAndDayOfWeek(
  tournamentId: number,
  dayOfWeek: DayOfWeek,
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

export async function getRefereeAssignmentsByTournamentId(
  tournamentId: number,
): Promise<Record<DayOfWeek, RefereeWithName | null>> {
  const results = await db
    .select({
      dayOfWeek: matchday.dayOfWeek,
      referee: getTableColumns(referee),
      profile: {
        firstName: profile.firstName,
        lastName: profile.lastName,
      },
    })
    .from(matchday)
    .innerJoin(referee, eq(matchday.refereeId, referee.id))
    .innerJoin(profile, eq(referee.profileId, profile.id))
    .where(eq(matchday.tournamentId, tournamentId))
    .orderBy(matchday.date);

  return results.reduce(
    (acc, entry) => {
      if (entry.referee != null) {
        acc[entry.dayOfWeek] = {
          ...entry.referee,
          profile: entry.profile,
        };
      }
      return acc;
    },
    {
      tuesday: null,
      thursday: null,
      friday: null,
    } as Record<DayOfWeek, RefereeWithName | null>,
  );
}
