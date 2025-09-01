import { db } from "../client";
import {
  eq,
  and,
  asc,
  or,
  sql,
  getTableColumns,
  isNull,
  isNotNull,
} from "drizzle-orm";
import { getCurrentLocalDateTime } from "@/lib/date";
import { group } from "../schema/group";
import { matchdayGame, matchdayReferee } from "../schema/matchday";
import { matchday } from "../schema/matchday";
import { game } from "../schema/game";
import { groupMatchEnteringHelper } from "../schema/matchEnteringHelper";
import { referee } from "../schema/referee";
import { profile } from "../schema/profile";
import { getMatchEnteringHelperIdByUserId } from "./match-entering-helper";
import invariant from "tiny-invariant";
import { alias } from "drizzle-orm/pg-core";
import { participant } from "../schema/participant";

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

export async function getParticipantGames(participantId: number) {
  return await db.query.game.findMany({
    where: (game, { and, or, eq, isNotNull }) =>
      and(
        or(
          eq(game.whiteParticipantId, participantId),
          eq(game.blackParticipantId, participantId),
        ),
        isNotNull(game.whiteParticipantId),
        isNotNull(game.blackParticipantId),
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
    game.whiteParticipant?.profile.userId === userId ||
    game.blackParticipant?.profile.userId === userId
  );
}

export async function getGamesByTournamentId(
  tournamentId: number,
  groupId?: number,
  matchdayId?: number,
  round?: number,
  participantId?: number,
) {
  const whiteParticipant = alias(participant, "whiteParticipant");
  const blackParticipant = alias(participant, "blackParticipant");

  const conditions = [
    eq(game.tournamentId, tournamentId),
    isNotNull(game.whiteParticipantId),
    isNotNull(game.blackParticipantId),
    isNull(whiteParticipant.deletedAt),
    isNull(blackParticipant.deletedAt),
  ];

  if (groupId !== undefined) {
    conditions.push(eq(game.groupId, groupId));
  }

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

  if (matchdayId !== undefined) {
    conditions.push(eq(matchdayGame.matchdayId, matchdayId));
  }

  const result = await db
    .select({
      gameId: game.id,
      date: matchday.date,
      groupNumber: group.groupNumber,
      round: game.round,
      boardNumber: game.boardNumber,
    })
    .from(game)
    .leftJoin(group, eq(game.groupId, group.id))
    .leftJoin(matchdayGame, eq(matchdayGame.gameId, game.id))
    .leftJoin(matchday, eq(matchdayGame.matchdayId, matchday.id))
    .leftJoin(
      whiteParticipant,
      eq(whiteParticipant.id, game.whiteParticipantId),
    )
    .leftJoin(
      blackParticipant,
      eq(blackParticipant.id, game.blackParticipantId),
    )
    .where(and(...conditions))
    .orderBy(
      asc(matchday.date),
      asc(group.groupNumber),
      asc(game.boardNumber),
      asc(game.round),
    );
  const gameIds = result.map((row) => row.gameId);

  if (gameIds.length === 0) {
    return [];
  }

  const games = await db.query.game.findMany({
    where: (game, { inArray }) => inArray(game.id, gameIds),
    with: {
      whiteParticipant: {
        columns: {
          fideRating: true,
          dwzRating: true,
        },
        with: {
          profile: {
            columns: {
              userId: true,
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true,
            },
          },
        },
      },
      blackParticipant: {
        columns: {
          fideRating: true,
          dwzRating: true,
        },
        with: {
          profile: {
            columns: {
              userId: true,
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true,
            },
          },
        },
      },
      group: {
        columns: {
          id: true,
          groupName: true,
          groupNumber: true,
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

  const gameMap = new Map(games.map((game) => [game.id, game]));
  return gameIds.map((id) => gameMap.get(id)).filter(Boolean);
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
    orderBy: (game, { asc }) => [
      asc(game.groupId),
      asc(game.round),
      asc(game.boardNumber),
    ],
    with: {
      matchdayGame: {
        with: {
          matchday: true,
        },
      },
    },
  });
  return result;
}

export async function getGamesInMonth(groupId: number, month: number) {
  return await db
    .select({
      ...getTableColumns(game),
      matchday: getTableColumns(matchday),
    })
    .from(game)
    .innerJoin(matchdayGame, eq(game.id, matchdayGame.gameId))
    .innerJoin(matchday, eq(matchdayGame.matchdayId, matchday.id))
    .where(
      and(
        eq(game.groupId, groupId),
        sql`EXTRACT(MONTH FROM ${matchday.date}) = ${month}`,
      ),
    )
    .orderBy(asc(matchday.date));
}

export async function getUncompletedGamesInMonth(
  groupId: number,
  month: number,
) {
  return await db
    .select({
      id: game.id,
      date: matchday.date,
    })
    .from(game)
    .innerJoin(matchdayGame, eq(game.id, matchdayGame.gameId))
    .innerJoin(matchday, eq(matchdayGame.matchdayId, matchday.id))
    .where(
      and(
        eq(game.groupId, groupId),
        sql`EXTRACT(MONTH FROM ${matchday.date}) = ${month}`,
        isNull(game.result),
      ),
    )
    .orderBy(asc(matchday.date))
    .then((games) => games.map((row) => row.id));
}

export async function getPendingGamesByParticipantId(participantId: number) {
  return await db
    .select({
      id: game.id,
      date: matchday.date,
    })
    .from(game)
    .innerJoin(matchdayGame, eq(game.id, matchdayGame.gameId))
    .innerJoin(matchday, eq(matchdayGame.matchdayId, matchday.id))
    .where(
      and(
        or(
          eq(game.whiteParticipantId, participantId),
          eq(game.blackParticipantId, participantId),
        ),
        isNull(game.result),
        sql`${matchday.date} < ${getCurrentLocalDateTime()}`,
      ),
    )
    .orderBy(asc(matchday.date))
    .then((participantGames) => participantGames.map((row) => row.id));
}

export async function getPendingGamesByRefereeId(refereeId: number) {
  return await db
    .select({
      id: game.id,
      date: matchday.date,
    })
    .from(game)
    .innerJoin(matchdayGame, eq(game.id, matchdayGame.gameId))
    .innerJoin(matchday, eq(matchdayGame.matchdayId, matchday.id))
    .innerJoin(matchdayReferee, eq(matchday.id, matchdayReferee.matchdayId))
    .where(
      and(
        eq(matchdayReferee.refereeId, refereeId),
        isNull(game.result),
        sql`${matchday.date} < ${getCurrentLocalDateTime()}`,
      ),
    )
    .orderBy(asc(matchday.date))
    .then((refereeGames) => refereeGames.map((row) => row.id));
}

export async function getGameWithParticipantsAndMatchday(gameId: number) {
  return await db.query.game.findFirst({
    where: (game, { eq, and, isNotNull }) =>
      and(
        eq(game.id, gameId),
        isNotNull(game.whiteParticipantId),
        isNotNull(game.blackParticipantId),
      ),
    with: {
      whiteParticipant: {
        columns: {
          id: true,
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

export async function getParticipantsInGroup(groupId: number) {
  const participantsInGroup = await db.query.participantGroup.findMany({
    where: (participantGroup, { eq }) => eq(participantGroup.groupId, groupId),
    with: {
      participant: {
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

export async function isUserMatchEnteringHelperInGame(
  gameId: number,
  userId: string,
): Promise<boolean> {
  const [groupData, matchEnteringHelperId] = await Promise.all([
    db
      .select({ groupId: game.groupId })
      .from(game)
      .where(eq(game.id, gameId))
      .limit(1),
    getMatchEnteringHelperIdByUserId(userId),
  ]);

  invariant(groupData && groupData.length > 0, "Group not found");

  const groupId = groupData[0].groupId;

  if (!groupId || !matchEnteringHelperId) {
    return false;
  }

  const assignment = await db
    .select()
    .from(groupMatchEnteringHelper)
    .where(
      and(
        eq(groupMatchEnteringHelper.groupId, groupId),
        eq(
          groupMatchEnteringHelper.matchEnteringHelperId,
          matchEnteringHelperId,
        ),
      ),
    )
    .limit(1);

  return assignment.length > 0;
}

export async function isUserRefereeInGame(gameId: number, userId: string) {
  const refereeAssignment = await db
    .select({
      refereeId: matchdayReferee.refereeId,
    })
    .from(game)
    .innerJoin(matchdayGame, eq(game.id, matchdayGame.gameId))
    .innerJoin(
      matchdayReferee,
      eq(matchdayGame.matchdayId, matchdayReferee.matchdayId),
    )
    .innerJoin(referee, eq(matchdayReferee.refereeId, referee.id))
    .innerJoin(profile, eq(referee.profileId, profile.id))
    .where(and(eq(game.id, gameId), eq(profile.userId, userId)))
    .limit(1);

  return refereeAssignment.length > 0;
}
