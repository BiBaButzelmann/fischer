import { db } from "../client";
import { trainer } from "../schema/trainer";
import { and, eq } from "drizzle-orm";

export async function getTrainerByProfileIdAndTournamentId(
  profileId: number,
  tournamentId: number,
) {
  return await db.query.trainer.findFirst({
    where: and(eq(trainer.profileId, profileId), eq(trainer.tournamentId, tournamentId)),
  });
}