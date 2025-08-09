import { db } from "../client";
import {
  matchEnteringHelper,
  groupMatchEnteringHelper,
} from "../schema/matchEnteringHelper";
import { and, eq, count } from "drizzle-orm";

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
