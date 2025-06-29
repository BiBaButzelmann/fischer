import { db } from "../client";
import { setupHelper } from "../schema/setupHelper";
import { and, eq } from "drizzle-orm";

export async function getSetupHelperByProfileIdAndTournamentId(
  profileId: number,
  tournamentId: number,
) {
  return await db.query.setupHelper.findFirst({
    where: and(
      eq(setupHelper.profileId, profileId),
      eq(setupHelper.tournamentId, tournamentId),
    ),
  });
}
