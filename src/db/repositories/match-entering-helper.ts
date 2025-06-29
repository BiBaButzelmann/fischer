import { db } from "../client";
import { matchEnteringHelper } from "../schema/matchEnteringHelper";
import { and, eq } from "drizzle-orm";

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
