import { db } from "../client";
import { referee } from "../schema/referee";
import { profile } from "../schema/profile";
import { matchday } from "../schema/matchday";
import { and, eq } from "drizzle-orm";
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
    .innerJoin(matchday, eq(matchday.refereeId, referee.id))
    .where(eq(referee.id, refereeId));
}
