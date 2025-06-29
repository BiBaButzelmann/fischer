import { db } from "../client";
import { referee } from "../schema/referee";
import { and, eq } from "drizzle-orm";

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
