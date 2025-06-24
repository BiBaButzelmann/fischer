import { db } from "@/db/client";
import { Tournament } from "@/db/types/tournament";
import { Pairings } from "./pairings";

export async function PairingsOverview({
  tournament,
}: {
  tournament: Tournament;
}) {
  const groupGames = await db.query.group.findMany({
    where: (group, { eq }) => eq(group.tournamentId, tournament.id),
    with: {
      games: {
        orderBy: (game, { asc }) => [asc(game.round), asc(game.boardNumber)],
        with: {
          whiteParticipant: {
            with: {
              profile: {
                columns: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          blackParticipant: {
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
    },
    orderBy: (group, { asc }) => [asc(group.groupNumber)],
  });

  return <Pairings groups={groupGames} />;
}
