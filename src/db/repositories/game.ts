import { db } from "../client";
import { sql } from "drizzle-orm";
import { tournament } from "../schema/tournament";
import { group } from "../schema/group";

export async function getGameById(gameId: number) {
  return await db.query.game.findFirst({
    where: (game, { eq }) => eq(game.id, gameId),
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
      pgn: true,
    },
  });
}

export async function getGamesOfParticipant(participantId: number) {
  return await db.query.game.findMany({
    where: (game, { or, eq }) =>
      or(
        eq(game.whiteParticipantId, participantId),
        eq(game.blackParticipantId, participantId),
      ),
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
  });
}

export async function isUserParticipantInGame(
  gameId: number,
  userId: string,
): Promise<boolean> {
  const game = await db.query.game.findFirst({
    where: (game, { eq }) => eq(game.id, gameId),
    with: {
      whiteParticipant: {
        with: {
          profile: {
            columns: {
              userId: true,
            },
          },
        },
      },
      blackParticipant: {
        with: {
          profile: {
            columns: {
              userId: true,
            },
          },
        },
      },
    },
  });

  if (!game) return false;

  return (
    game.whiteParticipant.profile.userId === userId ||
    game.blackParticipant.profile.userId === userId
  );
}

export async function getGamesByYearAndGroup(
  year: string,
  groupNumber: string,
) {
  return await db.query.game.findMany({
    where: (game, { and, eq }) =>
      and(
        eq(
          game.groupId,
          db
            .select({ id: group.id })
            .from(group)
            .where(
              and(
                eq(group.groupNumber, parseInt(groupNumber)),
                eq(
                  group.tournamentId,
                  db
                    .select({ id: tournament.id })
                    .from(tournament)
                    .where(
                      sql`EXTRACT(YEAR FROM ${tournament.startDate}) = ${parseInt(year)}`,
                    )
                    .limit(1),
                ),
              ),
            )
            .limit(1),
        ),
      ),
    with: {
      whiteParticipant: {
        columns: {
          fideRating: true,
        },
        with: {
          profile: {
            columns: {
              userId: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      blackParticipant: {
        columns: {
          fideRating: true,
        },
        with: {
          profile: {
            columns: {
              userId: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
    orderBy: (game, { asc }) => [asc(game.round), asc(game.boardNumber)],
  });
}
