"use server";

import { authWithRedirect } from "@/auth/utils";
import { db } from "@/db/client";
import { GameResult } from "@/db/types/game";
import { action } from "@/lib/actions";
import { generateDwzReport } from "@/lib/dwz-report/dwz-report";
import { PlayerEntry, Result } from "@/lib/dwz-report/types";
import { formatPlayerName } from "@/lib/fide-report/format-fide-name";
import { getRefereeOfGroup } from "@/services/referee";
import { getStandings } from "@/services/standings";
import invariant from "tiny-invariant";
import { match } from "ts-pattern";

export const generateDwzReportFile = action(async (groupId: number) => {
  const session = await authWithRedirect();
  invariant(session?.user.role === "admin", "Unauthorized");

  const data = await db.query.group.findFirst({
    where: (group, { eq }) => eq(group.id, groupId),
    with: {
      participants: {
        with: {
          participant: {
            with: {
              profile: true,
            },
          },
        },
      },
      tournament: {
        with: {
          organizer: true,
        },
      },
      games: {
        with: {
          matchdayGame: {
            with: {
              matchday: true,
            },
          },
        },
      },
    },
  });
  invariant(data, "Group not found");

  const groupReferee = await getRefereeOfGroup(groupId);

  const completedGames = data.games.filter((game) => {
    return game.result != null;
  });

  const actuallyPlayedGames = completedGames.filter((game) => {
    return game.whiteParticipantId != null && game.blackParticipantId != null;
  });

  const gamesAsWhiteParticipant = actuallyPlayedGames.reduce(
    (acc, game) => {
      acc[game.whiteParticipantId!] ??= [];
      acc[game.whiteParticipantId!].push(game.id);
      return acc;
    },
    {} as Record<number, number[]>,
  );

  const gamesAsBlackParticipant = actuallyPlayedGames.reduce(
    (acc, game) => {
      acc[game.blackParticipantId!] ??= [];
      acc[game.blackParticipantId!].push(game.id);
      return acc;
    },
    {} as Record<number, number[]>,
  );

  const standings = await getStandings(groupId);

  const getInitialGroupPositionOfPlayer = (participantId: number) => {
    const participant = data.participants.find(
      (p) => p.participant.id === participantId,
    );
    invariant(
      participant != null,
      `Participant ${participantId} could not be found in participants`,
    );
    return participant.groupPosition;
  };

  const getGroupPositionOfPlayer = (participantId: number) => {
    const currentGroupPosition = standings.findIndex(
      (s) => s.participantId === participantId,
    );
    invariant(
      currentGroupPosition >= 0,
      `Participant ${participantId} is not in the standings`,
    );
    return currentGroupPosition + 1;
  };

  const entries = data.participants.map(({ participant }) => {
    const whiteGameIds = gamesAsWhiteParticipant[participant.id] ?? [];
    const blackGameIds = gamesAsBlackParticipant[participant.id] ?? [];
    const participantGames = actuallyPlayedGames.filter(
      (game) =>
        whiteGameIds.includes(game.id) || blackGameIds.includes(game.id),
    );

    return {
      endGroupPosition: getGroupPositionOfPlayer(participant.id),
      startingGroupPosition: getInitialGroupPositionOfPlayer(participant.id),
      name: formatPlayerName(
        participant.profile.firstName,
        participant.profile.lastName,
        participant.profile.academicTitle,
      ),
      club: participant.chessClub.slice(0, 32),
      fideId: participant.fideId ?? undefined,
      zpsClubId: participant.zpsClubId ?? undefined,
      zpsPlayerId: participant.zpsPlayerId ?? undefined,
      results: participantGames.map((game) => {
        invariant(game.result, `Game ${game.id} does not have a result`);
        const isWhite = whiteGameIds.includes(game.id);
        const opponentId = isWhite
          ? game.blackParticipantId!
          : game.whiteParticipantId!;

        return {
          pieceColor: isWhite ? "W" : "B",
          result: mapResult(game.result, isWhite),
          opponentEndGroupPosition: getGroupPositionOfPlayer(opponentId),
          round: game.round,
        } satisfies Result;
      }),
    } satisfies PlayerEntry;
  });

  const sortedEntries = entries.sort(
    (entry1, entry2) => entry1.endGroupPosition - entry2.endGroupPosition,
  );

  const dwzReport = generateDwzReport(
    {
      groupNumber: data.groupNumber,
      numberOfPlayers: data.participants.length,
      numberOfRounds: data.participants.length - 1,
      tournamentName: `${data.tournament.name} - ${data.groupName}`,
    },
    sortedEntries,
    {
      tournamentName: data.tournament.name,
      location: data.tournament.location,
      startDate: data.tournament.startDate,
      endDate: data.tournament.endDate,
      timeLimit: data.tournament.timeLimit,
      tournamentOrganizer:
        data.tournament.organizer != null
          ? formatName(
              data.tournament.organizer.firstName,
              data.tournament.organizer.lastName,
            )
          : undefined,
      mainReferee:
        groupReferee != null
          ? formatName(groupReferee.firstName, groupReferee.lastName)
          : undefined,
    },
  );

  const fileName = `DWZ_Export_Group_${groupId}.txt`;

  return {
    dwzReport,
    fileName,
  };
});

function formatName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`;
}

function mapResult(result: GameResult, isWhite: boolean): Result["result"] {
  // TODO: wie mit -/+ spielen umgehen
  return match<GameResult, Result["result"]>(result)
    .with("+:-", () => (isWhite ? "+:" : "-:"))
    .with("-:-", () => (isWhite ? "-:" : "-:"))
    .with("-:+", () => (isWhite ? "-:" : "+:"))
    .with("0-½", () => (isWhite ? "0" : "R"))
    .with("0:1", () => (isWhite ? "0" : "1"))
    .with("1:0", () => (isWhite ? "1" : "0"))
    .with("½-0", () => (isWhite ? "R" : "0"))
    .with("½-½", () => (isWhite ? "R" : "R"))
    .exhaustive();
}
