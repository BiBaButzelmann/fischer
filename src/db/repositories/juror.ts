import { db } from "../client";
import { juror } from "../schema/juror";
import { and, eq } from "drizzle-orm";

export async function getJurorByProfileIdAndTournamentId(
  profileId: number,
  tournamentId: number,
) {
  return await db.query.juror.findFirst({
    where: and(eq(juror.profileId, profileId), eq(juror.tournamentId, tournamentId)),
  });
}
