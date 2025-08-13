import { db } from "../client";
import { matchEnteringHelper } from "../schema/matchEnteringHelper";
import { profile } from "../schema/profile";
import { and, eq } from "drizzle-orm";

export async function getMatchEnteringHelperIdByUserId(userId: string) {
  const userProfile = await db
    .select({ profileId: profile.id })
    .from(profile)
    .where(eq(profile.userId, userId))
    .limit(1);

  if (userProfile.length === 0) {
    return null;
  }

  const helper = await db
    .select({ id: matchEnteringHelper.id })
    .from(matchEnteringHelper)
    .where(eq(matchEnteringHelper.profileId, userProfile[0].profileId))
    .limit(1);

  return helper.length > 0 ? helper[0].id : null;
}

export async function getMatchEnteringHelperByProfileIdAndTournamentId(
  profileId: number,
  tournamentId: number,
) {
  return await db.query.matchEnteringHelper.findFirst({
    where: and(
      eq(matchEnteringHelper.profileId, profileId),
      eq(matchEnteringHelper.tournamentId, tournamentId),
    ),
  });
}
