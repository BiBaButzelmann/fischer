import { db } from "../client";
import {
  matchEnteringHelper,
  groupMatchEnteringHelper,
} from "../schema/matchEnteringHelper";
import { and, eq, count } from "drizzle-orm";
import { type MatchEnteringHelperWithAssignments } from "../types/match-entering-helper";

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

export async function getMatchEnteringHelperWithAssignmentsByProfileIdAndTournamentId(
  profileId: number,
  tournamentId: number,
): Promise<MatchEnteringHelperWithAssignments | undefined> {
  const matchEnteringHelperData = await db.query.matchEnteringHelper.findFirst({
    where: and(
      eq(matchEnteringHelper.profileId, profileId),
      eq(matchEnteringHelper.tournamentId, tournamentId),
    ),
  });

  if (!matchEnteringHelperData) {
    return undefined;
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

  return {
    ...matchEnteringHelperData,
    assignedGroupsCount: assignmentCount[0]?.count ?? 0,
  };
}
