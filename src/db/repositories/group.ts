import { db } from "../client";

export async function getGroupById(groupId: number) {
  return await db.query.group.findFirst({
    where: (group, { eq }) => eq(group.id, groupId),
    with: {
      participants: {
        orderBy: (participant, { asc }) => [asc(participant.groupPosition)],
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
      },
    },
  });
}

export async function getGroupsByTournamentId(tournamentId: number) {
  return await db.query.group.findMany({
    where: (group, { eq }) => eq(group.tournamentId, tournamentId),
    orderBy: (group, { asc }) => [asc(group.groupNumber)],
  });
}

export async function getGroupsWithMatchEnteringHelpersByTournamentId(
  tournamentId: number,
) {
  return await db.query.group.findMany({
    where: (group, { eq }) => eq(group.tournamentId, tournamentId),
    with: {
      matchEnteringHelpers: {
        with: {
          matchEnteringHelper: {
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
}

export async function getGroupsWithParticipantsByTournamentId(
  tournamentId: number,
) {
  return await db.query.group.findMany({
    where: (group, { eq }) => eq(group.tournamentId, tournamentId),
    with: {
      participants: {
        orderBy: (participant, { asc }) => [asc(participant.groupPosition)],
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
      },
    },
    orderBy: (group, { asc }) => [asc(group.groupNumber)],
  });
}

export async function getGroupsWithGamesByTournamentId(tournamentId: number) {
  return await db.query.group.findMany({
    where: (group, { eq }) => eq(group.tournamentId, tournamentId),
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
}

export async function getGroupsWithParticipantsAndGamesByTournamentId(
  tournamentId: number,
) {
  const groups = await db.query.group.findMany({
    where: (group, { eq }) => eq(group.tournamentId, tournamentId),
    with: {
      participants: {
        orderBy: (participant, { asc }) => [asc(participant.groupPosition)],
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
      },
      games: {
        orderBy: (game, { asc }) => [asc(game.round), asc(game.boardNumber)],
        with: {
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
      },
    },
    orderBy: (group, { asc }) => [asc(group.groupNumber)],
  });

  for (const group of groups) {
    for (const game of group.games) {
      if (!game.matchdayGame?.matchday?.date) {
        throw new Error(
          `Game ${game.id} in group ${group.groupName || group.groupNumber} has no matchday relation. All games must be scheduled to matchdays.`,
        );
      }
    }
  }

  return groups;
}
