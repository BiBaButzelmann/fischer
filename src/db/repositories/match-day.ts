import { db } from "../client";
import { matchday } from "../schema/matchday";
import { eq } from "drizzle-orm";

export async function getAllMatchdaysByTournamentId(tournamentId: number) {
  return await db.query.matchday.findMany({
    where: eq(matchday.tournamentId, tournamentId),
    orderBy: (matchday, { asc }) => [asc(matchday.date)],
  });
}

export async function getMatchdaysWithRefereeAndSetupHelpersByTournamentId(
  tournamentId: number,
) {
  return await db.query.matchday.findMany({
    where: eq(matchday.tournamentId, tournamentId),
    with: {
      referees: {
        with: {
          referee: {
            with: {
              profile: {
                columns: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      },
      setupHelpers: {
        with: {
          setupHelper: {
            with: {
              profile: {
                columns: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      },
      tournamentWeek: true,
    },
    orderBy: (matchday, { asc }) => [asc(matchday.date)],
  });
}
