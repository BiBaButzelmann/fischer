import { db } from "../client";
import { referee } from "../schema/referee";
import { profile } from "../schema/profile";
import { matchday, matchdayReferee } from "../schema/matchday";
import { and, eq, count, isNull, or } from "drizzle-orm";
import type { RefereeWithName } from "../types/referee";

export async function getRefereeByProfileIdAndTournamentId(
  profileId: number,
  tournamentId: number,
) {
  return await db.query.referee.findFirst({
    where: and(
      eq(referee.profileId, profileId),
      eq(referee.tournamentId, tournamentId),
    ),
  });
}

export async function getRefereeAssignmentCountByProfileIdAndTournamentId(
  profileId: number,
  tournamentId: number,
): Promise<number> {
  const refereeData = await db.query.referee.findFirst({
    where: and(
      eq(referee.profileId, profileId),
      eq(referee.tournamentId, tournamentId),
    ),
  });

  if (!refereeData) {
    return 0;
  }

  const assignmentCount = await db
    .select({ count: count() })
    .from(matchdayReferee)
    .where(eq(matchdayReferee.refereeId, refereeData.id));

  return assignmentCount[0]?.count ?? 0;
}

export async function getRefereesByTournamentId(
  tournamentId: number,
): Promise<RefereeWithName[]> {
  return await db.query.referee.findMany({
    where: eq(referee.tournamentId, tournamentId),
    with: {
      profile: {
        columns: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });
}

export async function getRefereeByUserId(userId: string) {
  const rows = await db
    .select()
    .from(referee)
    .leftJoin(profile, eq(referee.profileId, profile.id))
    .where(eq(profile.userId, userId));
  return rows.length > 0 ? rows[0].referee : undefined;
}

export async function getMatchdaysByRefereeId(refereeId: number) {
  return await db
    .select({
      referee: referee,
      matchday: matchday,
    })
    .from(referee)
    .innerJoin(matchdayReferee, eq(matchdayReferee.refereeId, referee.id))
    .innerJoin(matchday, eq(matchday.id, matchdayReferee.matchdayId))
    .where(
      and(
        eq(referee.id, refereeId),
        or(
          isNull(matchdayReferee.canceled),
          eq(matchdayReferee.canceled, false),
        ),
      ),
    );
}

export async function getRefereeByMatchdayId(matchdayId: number) {
  return await db
    .select({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phoneNumber: profile.phoneNumber,
    })
    .from(matchdayReferee)
    .innerJoin(referee, eq(matchdayReferee.refereeId, referee.id))
    .innerJoin(profile, eq(referee.profileId, profile.id))
    .where(
      and(
        eq(matchdayReferee.matchdayId, matchdayId),
        isNull(referee.deletedAt),
      ),
    )
    .then((rows) => rows[0] || null);
}
