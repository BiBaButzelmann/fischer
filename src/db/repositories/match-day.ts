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

export async function getGroupIdsByMatchdayId(matchdayId: number) {
  const data = await db.query.matchdayGame.findMany({
    where: (matchdayGame, { eq }) => eq(matchdayGame.matchdayId, matchdayId),
    with: {
      game: {
        columns: {
          groupId: true,
        },
      },
    },
  });
  return Array.from(new Set(data.map((item) => item.game.groupId)));
}
