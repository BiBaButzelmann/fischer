import { db } from "@/db/client";
import { gamePostponement } from "@/db/schema/gamePostponement";
import { game } from "@/db/schema/game";
import { eq, and, desc, or, inArray } from "drizzle-orm";

export async function getAllPostponements(
  tournamentId: number,
  participantIds?: number[],
) {
  return await db.query.gamePostponement.findMany({
    with: {
      game: {
        with: {
          whiteParticipant: {
            with: { profile: true },
          },
          blackParticipant: {
            with: { profile: true },
          },
          group: {
            columns: { id: true, groupName: true },
          },
          matchdayGame: {
            with: {
              matchday: {
                columns: { id: true, date: true },
              },
            },
          },
        },
      },
      participant: {
        with: { profile: true },
      },
      postponedByProfile: {
        columns: { id: true, firstName: true, lastName: true },
      },
    },
    where: (postponement, { exists }) =>
      exists(
        db
          .select()
          .from(game)
          .where(
            and(
              eq(game.id, postponement.gameId),
              eq(game.tournamentId, tournamentId),
              participantIds
                ? or(
                    inArray(game.whiteParticipantId, participantIds),
                    inArray(game.blackParticipantId, participantIds),
                  )
                : undefined,
            ),
          ),
      ),
    orderBy: [desc(gamePostponement.createdAt)],
  });
}
