import { db } from "../client";
import {
  matchEnteringHelper,
  groupMatchEnteringHelper,
} from "../schema/matchEnteringHelper";
import { profile } from "../schema/profile";
import { and, eq, count } from "drizzle-orm";

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

export async function getMatchEnteringHelperAssignmentCountByProfileIdAndTournamentId(
  profileId: number,
  tournamentId: number,
): Promise<number> {
  const matchEnteringHelperData = await db.query.matchEnteringHelper.findFirst({
    where: and(
      eq(matchEnteringHelper.profileId, profileId),
      eq(matchEnteringHelper.tournamentId, tournamentId),
    ),
  });

  if (!matchEnteringHelperData) {
    return 0;
  }

  const assignmentCount = await db
    .select({ count: count() })
    .from(groupMatchEnteringHelper)
    .where(
      eq(
        groupMatchEnteringHelper.matchEnteringHelperId,
        matchEnteringHelperData.id,
      ),
    );

  return assignmentCount[0]?.count ?? 0;
}

export async function getAssignedGroupsByMatchEnteringHelperId(
  matchEnteringHelperId: number,
) {
  return await db
    .select({ groupId: groupMatchEnteringHelper.groupId })
    .from(groupMatchEnteringHelper)
    .where(
      eq(groupMatchEnteringHelper.matchEnteringHelperId, matchEnteringHelperId),
    );
}
