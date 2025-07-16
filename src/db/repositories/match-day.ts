import { db } from "../client";
import { matchday } from "../schema/matchday";
import { referee } from "../schema/referee";
import { profile } from "../schema/profile";
import { and, eq, isNotNull, getTableColumns } from "drizzle-orm";
import type { MatchDay } from "../types/group";
import type { RefereeWithName } from "../types/referee";
import { availableMatchDays } from "../schema/columns.helpers";

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

export async function getRefereeAssignmentsByTournamentId(
  tournamentId: number,
): Promise<Record<MatchDay, RefereeWithName | null>> {
  const results = await db
    .select({
      dayOfWeek: matchday.dayOfWeek,
      referee: getTableColumns(referee),
      firstName: profile.firstName,
      lastName: profile.lastName,
    })
    .from(matchday)
    .leftJoin(referee, eq(matchday.refereeId, referee.id))
    .leftJoin(profile, eq(referee.profileId, profile.id))
    .where(eq(matchday.tournamentId, tournamentId))
    .orderBy(matchday.date);

  return results.reduce(
    (acc, entry) => {
      const { dayOfWeek, ...refereeWithName } = entry;
      if (dayOfWeek != null) {
        acc[dayOfWeek] =
          refereeWithName.referee?.id &&
          refereeWithName.firstName &&
          refereeWithName.lastName
            ? {
                ...refereeWithName.referee,
                profile: {
                  firstName: refereeWithName.firstName,
                  lastName: refereeWithName.lastName,
                },
              }
            : null;
      }
      return acc;
    },
    availableMatchDays.reduce(
      (init, day) => {
        init[day] = null;
        return init;
      },
      {} as Record<MatchDay, RefereeWithName | null>,
    ),
  );
}
