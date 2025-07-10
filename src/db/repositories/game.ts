import { db } from "../client";
import { eq } from "drizzle-orm";
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
      tournament: {
        columns: {
          name: true,
        },
      },
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

export async function getGamesByGroup(
  groupId: number,
  round?: number,
  participantId?: number,
) {
  return await db.query.game.findMany({
    where: (game, { and, eq, or }) => {
      const conditions = [eq(game.groupId, groupId)];

      if (round !== undefined) {
        conditions.push(eq(game.round, round));
      }

      if (participantId !== undefined) {
        const participantCondition = or(
          eq(game.whiteParticipantId, participantId),
          eq(game.blackParticipantId, participantId),
        );
        if (participantCondition) {
          conditions.push(participantCondition);
        }
      }

      return conditions.length > 1 ? and(...conditions) : conditions[0];
    },
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

export async function getAllGroupNamesByTournamentId(tournamentId: number) {
  return await db
    .select({
      id: group.id,
      groupName: group.groupName,
    })
    .from(group)
    .where(eq(group.tournamentId, tournamentId))
    .orderBy(group.groupNumber);
}
