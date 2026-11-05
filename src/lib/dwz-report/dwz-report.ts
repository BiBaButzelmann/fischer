import { CLUB_FEDERATION } from "@/constants/constants";
import { parseDateOnly } from "@/lib/date";
import { generateFideReport } from "@/lib/fide-report";
import { formatPlayerName } from "@/lib/fide-report/format-fide-name";
import type {
  PlayerEntry,
  Result,
  TournamentSectionData,
} from "@/lib/fide-report/types";
import { nextEvenNumber } from "@/lib/pairing-utils";
import invariant from "tiny-invariant";
import type {
  DwzReportGame,
  DwzReportInput,
  DwzReportParticipant,
} from "./types";

/**
 * The DSB accepts FIDE TRF files for DWZ evaluation. For tournaments ending
 * after 2026-06-07 the legacy Eloref/SWI format is no longer accepted, so the
 * DWZ report is generated as a FIDE TRF file. The long-term replacement is the
 * DSB XML 2.5 schema; TRF is the accepted transition format.
 * See https://www.schachbund.de/news/informationen-zur-einfuehrung-des-wertungsportals-und-der-anpassung-der-dwz.html
 */
export function generateDwzReport(input: DwzReportInput): string {
  const participantsById = new Map(
    input.participants.map((participant) => [participant.id, participant]),
  );
  const numberOfRounds = getNumberOfRounds(input);
  const roundDates = getRoundDates(input.games, numberOfRounds);
  const participantsWithGameByRound = getParticipantsWithGameByRound(
    input.games,
  );
  const isOddSizedGroup = input.participants.length % 2 === 1;

  const playerSectionData: PlayerEntry[] = [...input.participants]
    .sort((a, b) => a.startingPosition - b.startingPosition)
    .map((participant) => {
      const standingsIndex = input.standings.findIndex(
        (standing) => standing.participantId === participant.id,
      );
      invariant(
        standingsIndex >= 0,
        `Participant ${participant.id} is not in the standings`,
      );

      return {
        startingPosition: participant.startingPosition,
        gender: participant.gender ?? undefined,
        title: participant.title ?? "",
        name: formatPlayerName(
          participant.firstName,
          participant.lastName,
          participant.academicTitle,
        ),
        fideRating:
          participant.fideRating != null && participant.fideRating > 0
            ? participant.fideRating
            : undefined,
        fideNation: participant.nationality?.trim() || CLUB_FEDERATION,
        fideId: participant.fideId?.trim() || undefined,
        birthDate: formatBirthDate(participant),
        points: input.standings[standingsIndex].points,
        rank: standingsIndex + 1,
        results: getResults({
          participant,
          games: input.games,
          participantsById,
          participantsWithGameByRound,
          numberOfRounds,
          isOddSizedGroup,
        }),
      };
    });

  const tournamentSectionData: TournamentSectionData = {
    tournamentName: `${input.tournamentName} - ${input.groupName}`,
    location: input.location,
    federation: CLUB_FEDERATION,
    startDate: parseDateOnly(input.startDate),
    endDate: parseDateOnly(input.endDate),
    numberOfPlayers: input.participants.length,
    numberOfRatedPlayers: input.participants.filter(
      (participant) =>
        (participant.dwzRating != null && participant.dwzRating > 0) ||
        (participant.fideRating != null && participant.fideRating > 0),
    ).length,
    tournamentType: "Individual round robin",
    referee: input.referee ?? "",
    timeLimit: input.timeLimit,
    roundDates,
  };

  return generateFideReport(tournamentSectionData, playerSectionData);
}

function getNumberOfRounds(input: DwzReportInput): number {
  if (input.games.length > 0) {
    return Math.max(
      Math.max(...input.games.map((game) => game.round)),
      1,
    );
  }

  return Math.max(nextEvenNumber(input.participants.length) - 1, 1);
}

function getRoundDates(games: DwzReportGame[], numberOfRounds: number) {
  return Array.from({ length: numberOfRounds }, (_, index) => {
    const round = index + 1;
    const gamesInRound = games.filter((game) => game.round === round);
    if (gamesInRound.length === 0) {
      return undefined;
    }

    const occurrencesByDate = new Map<string, number>();
    for (const game of gamesInRound) {
      occurrencesByDate.set(
        game.date,
        (occurrencesByDate.get(game.date) ?? 0) + 1,
      );
    }

    const date = Array.from(occurrencesByDate.entries()).sort(
      ([dateA, countA], [dateB, countB]) =>
        countB - countA || dateA.localeCompare(dateB),
    )[0]?.[0];

    return date ? parseDateOnly(date) : undefined;
  });
}

function getParticipantsWithGameByRound(games: DwzReportGame[]) {
  const participantsWithGameByRound = new Map<number, Set<number>>();

  for (const game of games) {
    const participants =
      participantsWithGameByRound.get(game.round) ?? new Set<number>();
    participants.add(game.whiteParticipantId);
    participants.add(game.blackParticipantId);
    participantsWithGameByRound.set(game.round, participants);
  }

  return participantsWithGameByRound;
}

function getResults({
  participant,
  games,
  participantsById,
  participantsWithGameByRound,
  numberOfRounds,
  isOddSizedGroup,
}: {
  participant: DwzReportParticipant;
  games: DwzReportGame[];
  participantsById: Map<number, DwzReportParticipant>;
  participantsWithGameByRound: Map<number, Set<number>>;
  numberOfRounds: number;
  isOddSizedGroup: boolean;
}): Result[] {
  const participantGames = games.filter(
    (game) =>
      game.whiteParticipantId === participant.id ||
      game.blackParticipantId === participant.id,
  );
  const roundsWithGame = new Set(participantGames.map((game) => game.round));

  const results: Result[] = participantGames
    .filter((game) => game.result != null)
    .map((game) => {
      const isWhite = game.whiteParticipantId === participant.id;
      const opponentId = isWhite
        ? game.blackParticipantId
        : game.whiteParticipantId;
      const opponent = participantsById.get(opponentId);
      invariant(opponent, `Participant ${opponentId} could not be found`);

      return {
        round: game.round,
        opponentStartingPosition: opponent.startingPosition,
        pieceColor: isWhite ? "w" : "b",
        result: game.result!,
      };
    });

  // Round-robin byes are not stored as games. Keep their round slot in the
  // report as a zero-point bye ("Z"), but do not count them as rated games.
  if (isOddSizedGroup) {
    for (let round = 1; round <= numberOfRounds; round++) {
      if (roundsWithGame.has(round)) {
        continue;
      }

      const participantsWithGame =
        participantsWithGameByRound.get(round) ?? new Set<number>();
      const missingParticipants = Array.from(participantsById.values()).filter(
        (candidate) => !participantsWithGame.has(candidate.id),
      );

      if (
        missingParticipants.length === 1 &&
        missingParticipants[0]?.id === participant.id
      ) {
        results.push({
          round,
          opponentStartingPosition: null,
          pieceColor: null,
          result: "Z",
        });
      }
    }
  }

  return results.sort((a, b) => (a.round ?? 0) - (b.round ?? 0));
}

function formatBirthDate(
  participant: DwzReportParticipant,
): string | undefined {
  if (participant.birthDate != null) {
    return parseDateOnly(participant.birthDate).toFormat("yyyy/MM/dd");
  }
  if (participant.birthYear != null) {
    return `${participant.birthYear}/00/00`;
  }
  return undefined;
}
