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
      matchdayGame: {
        with: {
          matchday: {
            columns: {
              date: true,
            },
          },
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
      matchdayGame: {
        with: {
          matchday: {
            columns: {
              date: true,
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

export async function getCompletedGames(groupId: number, maxRound?: number) {
  const result = await db.query.game.findMany({
    where: (game, { and, eq, lte, isNotNull }) => {
      const conditions = [eq(game.groupId, groupId), isNotNull(game.result)];

      if (maxRound !== undefined) {
        conditions.push(lte(game.round, maxRound));
      }

      return and(...conditions);
    },
    columns: {
      id: true,
      whiteParticipantId: true,
      blackParticipantId: true,
      result: true,
      round: true,
    },
    with: {
      whiteParticipant: {
        columns: {
          id: true,
          dwzRating: true,
          fideRating: true,
          title: true,
        },
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
        columns: {
          id: true,
          dwzRating: true,
          fideRating: true,
          title: true,
        },
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
    orderBy: (game, { asc }) => [asc(game.round), asc(game.boardNumber)],
  });
  return result;
}

export async function getParticipantsInGroup(groupId: number) {
  const participantsInGroup = await db.query.participantGroup.findMany({
    where: (participantGroup, { eq }) => eq(participantGroup.groupId, groupId),
    with: {
      participant: {
        columns: {
          id: true,
          dwzRating: true,
          fideRating: true,
          title: true,
        },
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

  return participantsInGroup.map(({ participant }) => participant);
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
