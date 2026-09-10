import { db } from "../client";
import {
  eq,
  and,
  asc,
  or,
  sql,
  getTableColumns,
  isNull,
  lte,
} from "drizzle-orm";
import { todayDateOnly } from "@/lib/date";
import { getDateTimeFromTournamentTime } from "@/lib/game-time";
import { group } from "../schema/group";
import { matchdayGame, matchdayReferee } from "../schema/matchday";
import { matchday } from "../schema/matchday";
import { game } from "../schema/game";
import {
  groupMatchEnteringHelper,
  matchEnteringHelper,
} from "../schema/matchEnteringHelper";
import { participant } from "../schema/participant";
import { profile } from "../schema/profile";
import { getMatchEnteringHelperIdByUserIdAndTournamentId } from "./match-entering-helper";
import invariant from "tiny-invariant";
import { PLAYED_GAME_RESULTS } from "../types/game";

export async function getGameTournamentId(
  gameId: number,
): Promise<number | null> {
  const result = await db.query.game.findFirst({
    where: (game, { eq }) => eq(game.id, gameId),
    columns: { tournamentId: true },
  });
  return result?.tournamentId ?? null;
}

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
          gameStartTime: true,
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
      tournament: {
        columns: {
          gameStartTime: true,
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
    .where(
      and(
        eq(game.tournamentId, tournamentId),
        groupId !== undefined ? eq(game.groupId, groupId) : undefined,
        round !== undefined ? eq(game.round, round) : undefined,
        participantId !== undefined
          ? or(
              eq(game.whiteParticipantId, participantId),
              eq(game.blackParticipantId, participantId),
            )
          : undefined,
        matchdayId !== undefined
          ? eq(matchdayGame.matchdayId, matchdayId)
          : undefined,
      ),
    )
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
          deletedAt: true,
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
          deletedAt: true,
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
      tournament: {
        columns: {
          gameStartTime: true,
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
      pgn: {
        columns: {
          value: true,
        },
      },
    },
  });

  const gameMap = new Map(games.map((game) => [game.id, game]));
  const orderedGames = gameIds.map((id) => gameMap.get(id)).filter(Boolean);

  const gamesWithTime = orderedGames.map((game) => ({
    ...game,
    time: getDateTimeFromTournamentTime(
      game.matchdayGame.matchday.date,
      game.tournament.gameStartTime,
    ).toJSDate(),
  }));

  return gamesWithTime;
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

export async function getUncompletedGamesByGroup(groupId: number) {
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
        lte(matchday.date, todayDateOnly()),
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
        lte(matchday.date, todayDateOnly()),
      ),
    )
    .orderBy(asc(matchday.date))
    .then((refereeGames) => refereeGames.map((row) => row.id));
}

export async function getGameWithParticipantsAndMatchday(gameId: number) {
  return await db.query.game.findFirst({
    where: (game, { eq }) => eq(game.id, gameId),
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
      tournament: {
        columns: {
          gameStartTime: true,
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
          profile: true,
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
    .orderBy(group.groupName);
}

export async function isUserMatchEnteringHelperInGame(
  gameId: number,
  userId: string,
) {
  const groupData = await db
    .select({ groupId: game.groupId, tournamentId: game.tournamentId })
    .from(game)
    .where(eq(game.id, gameId))
    .limit(1);

  invariant(groupData && groupData.length > 0, "Group not found");

  const groupId = groupData[0].groupId;
  const matchEnteringHelperId =
    await getMatchEnteringHelperIdByUserIdAndTournamentId(
      userId,
      groupData[0].tournamentId,
    );

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

export async function getGamesToEnterByUserIdAndTournamentId(
  userId: string,
  tournamentId: number,
) {
  return await db.query.game.findMany({
    where: (game, { and, or, eq, exists, inArray }) =>
      and(
        eq(game.tournamentId, tournamentId),
        inArray(game.result, PLAYED_GAME_RESULTS),
        or(
          exists(
            db
              .select()
              .from(participant)
              .innerJoin(profile, eq(participant.profileId, profile.id))
              .where(
                and(
                  eq(profile.userId, userId),
                  or(
                    eq(game.whiteParticipantId, participant.id),
                    eq(game.blackParticipantId, participant.id),
                  ),
                ),
              ),
          ),
          exists(
            db
              .select()
              .from(groupMatchEnteringHelper)
              .innerJoin(
                matchEnteringHelper,
                eq(
                  groupMatchEnteringHelper.matchEnteringHelperId,
                  matchEnteringHelper.id,
                ),
              )
              .innerJoin(profile, eq(matchEnteringHelper.profileId, profile.id))
              .where(
                and(
                  eq(profile.userId, userId),
                  eq(game.groupId, groupMatchEnteringHelper.groupId),
                ),
              ),
          ),
        ),
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
      pgn: true,
    },
    orderBy: (game, { asc }) => [asc(game.round)],
  });
}
