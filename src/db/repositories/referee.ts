import { db } from "../client";
import { referee } from "../schema/referee";
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
