"use server";

import { authWithRedirect } from "@/auth/utils";
import { CLUB_FEDERATION, monthLabels } from "@/constants/constants";
import { db } from "@/db/client";
import { getGamesInMonth } from "@/db/repositories/game";
import { action, ActionError } from "@/lib/actions";
import { generateFideReport } from "@/lib/fide-report";
import {
  formatPlayerName,
  formatRefereeName,
} from "@/lib/fide-report/format-fide-name";
import { PlayerEntry } from "@/lib/fide-report/types";
import { calculateStandings } from "@/lib/standings";
import { parseDateOnly, toDateOnly, toLocalDateTime } from "@/lib/date";
import invariant from "tiny-invariant";
import { getRefereeOfGroup } from "@/services/referee";
import { getDsbPersonById } from "@/lib/dsb/wertungsportal";
import { mapDsbPersonToCandidate } from "@/lib/dsb/candidate";
import { resolveFideData, type FideData } from "@/lib/dsb/ratings";
import { getParticipantFullName } from "@/lib/participant";
import type { ParticipantWithName } from "@/db/types/participant";

export const generateFideReportFile = action(
  async (groupId: number, month: number) => {
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
        tournament: true,
        games: true,
      },
    });
    invariant(data, "Group not found");

    const groupReferee = await getRefereeOfGroup(groupId, month);
    invariant(groupReferee, "Referee not found for the specified month");

    const gamesInMonth = await getGamesInMonth(groupId, month);

    const completedGames = gamesInMonth.filter((game) => {
      return game.result != null;
    });

    const gamesWithActiveParticipants = completedGames.filter((game) => {
      const date = game.matchday.date;
      const whiteParticipant = data.participants.find(
        (p) => p.participant.id === game.whiteParticipantId,
      );
      const blackParticipant = data.participants.find(
        (p) => p.participant.id === game.blackParticipantId,
      );
      invariant(
        whiteParticipant,
        `White participant ${game.whiteParticipantId} not found`,
      );
      invariant(
        blackParticipant,
        `Black participant ${game.blackParticipantId} not found`,
      );

      const isWhiteParticipantDisabled =
        whiteParticipant.participant.deletedAt != null &&
        toDateOnly(toLocalDateTime(whiteParticipant.participant.deletedAt)) <
          date;
      const isBlackParticipantDisabled =
        blackParticipant.participant.deletedAt != null &&
        toDateOnly(toLocalDateTime(blackParticipant.participant.deletedAt)) <
          date;

      return !isWhiteParticipantDisabled && !isBlackParticipantDisabled;
    });

    const standings = calculateStandings(
      gamesWithActiveParticipants,
      data.participants.map((p) => p.participant),
    );

    const getPointsOfPlayer = (participantId: number) => {
      const standing = standings.find((s) => s.participantId === participantId);
      invariant(
        standing != null,
        `Participant ${participantId} could not be found in standings`,
      );
      return standing.points;
    };

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

    const entries = await Promise.all(
      data.participants.map(async ({ groupPosition, participant }) => {
        const participantGames = gamesWithActiveParticipants.filter(
          (game) =>
            game.whiteParticipantId === participant.id ||
            game.blackParticipantId === participant.id,
        );

        const { fideId, fideRating, nationality, title, birthYear, gender } =
          await getLiveFideData(participant);
        invariant(
          fideId != null,
          `Participant ${participant.id} does not have a FIDE ID`,
        );
        invariant(
          fideRating != null,
          `Participant ${participant.id} does not have a FIDE rating`,
        );
        invariant(
          birthYear != null,
          `Participant ${participant.id} does not have a birth year`,
        );
        invariant(
          nationality != null,
          `Participant ${participant.id} does not have a nationality`,
        );

        const currentGroupPosition = getGroupPositionOfPlayer(participant.id);
        const currentPoints = getPointsOfPlayer(participant.id);

        return {
          startingPosition: groupPosition,
          gender: gender ?? undefined,
          title: title ?? "",
          name: formatPlayerName(
            participant.profile.firstName,
            participant.profile.lastName,
            participant.profile.academicTitle,
          ),
          fideRating,
          fideNation: nationality,
          fideId,
          birthDate: `${birthYear}/00/00`,
          points: currentPoints,
          rank: currentGroupPosition,
          results: participantGames.map((game) => {
            invariant(game.result, `Game ${game.id} does not have a result`);
            const isWhite = game.whiteParticipantId === participant.id;

            return {
              scheduled: parseDateOnly(game.matchday.date),
              opponentStartingPosition: getInitialGroupPositionOfPlayer(
                isWhite ? game.blackParticipantId : game.whiteParticipantId,
              ),
              pieceColor: isWhite ? "w" : "b",
              result: game.result,
            };
          }),
        } satisfies PlayerEntry;
      }),
    );

    // 012
    const tournamentName = `${data.tournament.name} - ${data.groupName}`;
    // 022
    const location = data.tournament.location;
    // 032
    const federation = CLUB_FEDERATION;
    // 042
    const startDate = data.tournament.startDate;
    // 052
    const endDate = data.tournament.endDate;
    // 062
    const numberOfPlayers = data.participants.length;
    // 072
    const numberOfRatedPlayers = numberOfPlayers;
    // 092
    const tournamentType = "Individual round robin";
    // 102
    const referee = formatRefereeName(
      groupReferee.firstName,
      groupReferee.lastName,
    );
    // 122
    const timeLimit = data.tournament.timeLimit;

    const fideReport = generateFideReport(
      {
        tournamentName,
        location,
        federation,
        startDate: parseDateOnly(startDate),
        endDate: parseDateOnly(endDate),
        numberOfPlayers,
        numberOfRatedPlayers,
        tournamentType,
        referee,
        timeLimit,
      },
      entries,
    );

    const monthName = monthLabels[month - 1];
    const fileName = `FIDE_Export_${data.tournament.name.replace(" ", "_")}_${data.groupName.replace(" ", "_")} ${monthName}.txt`;

    return {
      fideReport,
      fileName,
    };
  },
);

async function getLiveFideData(
  participant: ParticipantWithName,
): Promise<FideData> {
  if (participant.dsbPersonId == null) {
    return participant;
  }
  const person = await getDsbPersonById(participant.dsbPersonId);
  if (person == null) {
    throw new ActionError(
      `DSB-Daten für ${getParticipantFullName(participant)} nicht abrufbar`,
    );
  }
  return resolveFideData(participant, mapDsbPersonToCandidate(person));
}
