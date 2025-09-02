import { StandingsSelector } from "./standings-selector";
import { StandingsTable } from "./standings-table";
import {
  getParticipantsInGroup,
  getCompletedGames,
} from "@/db/repositories/game";
import { calculateStandings } from "@/lib/standings";
import type { TournamentNames } from "@/db/types/tournament";
import type { GroupSummary } from "@/db/types/group";
import { Game, GameWithMatchday } from "@/db/types/game";
import { getCurrentLocalDateTime, toLocalDateTime } from "@/lib/date";

type Props = {
  tournamentNames: TournamentNames[];
  groups: GroupSummary[];
  rounds: number[];
  selectedTournamentId: string;
  selectedGroupId: string;
  selectedRound?: string;
};

export async function StandingsDisplay({
  tournamentNames,
  groups,
  rounds,
  selectedTournamentId,
  selectedGroupId,
  selectedRound,
}: Props) {
  const participants = await getParticipantsInGroup(Number(selectedGroupId));
  const games = await getCompletedGames(
    Number(selectedGroupId),
    selectedRound ? Number(selectedRound) : undefined,
  );

  const gamesPlayedPerParticipant = games.reduce(
    (acc, game) => {
      const { whiteParticipantId, blackParticipantId } = game;

      if (whiteParticipantId != null) {
        acc[whiteParticipantId] = acc[whiteParticipantId] || [];
        acc[whiteParticipantId].push(game);
      }
      if (blackParticipantId != null) {
        acc[blackParticipantId] = acc[blackParticipantId] || [];
        acc[blackParticipantId].push(game);
      }
      return acc;
    },
    {} as Record<number, GameWithMatchday[]>,
  );

  // participants that are relevant for the standings calculation
  // participant is relevant if they are active
  // or when they are deactivated but have played at least 50% of their games
  const relevantParticipantIds: Set<number> = new Set();

  for (const participant of participants) {
    const { deletedAt } = participant;

    if (deletedAt == null) {
      relevantParticipantIds.add(participant.id);
      continue;
    }

    const totalGamesToPlay = rounds.length;
    const gamesPlayed = gamesPlayedPerParticipant[participant.id] || [];
    const gamesPlayedBeforeDisabling = gamesPlayed.filter((g) => {
      return g.matchdayGame.matchday.date < participant.deletedAt!;
    });
    const gamesPlayedCount = gamesPlayedBeforeDisabling.length;

    if (gamesPlayedCount / totalGamesToPlay >= 0.5) {
      relevantParticipantIds.add(participant.id);
      continue;
    }
  }

  // game is relevant if neither participant is "irrelevant"
  // and the game is not in the future
  const relevantGames: Set<Game> = new Set();

  const now = getCurrentLocalDateTime();
  for (const game of games) {
    if (toLocalDateTime(game.matchdayGame.matchday.date) > now) {
      continue;
    }

    const { whiteParticipantId, blackParticipantId } = game;

    const isRelevantWhiteParticipant =
      whiteParticipantId == null ||
      relevantParticipantIds.has(whiteParticipantId);
    const isRelevantBlackParticipant =
      blackParticipantId == null ||
      relevantParticipantIds.has(blackParticipantId);

    if (isRelevantWhiteParticipant && isRelevantBlackParticipant) {
      relevantGames.add(game);
    }
  }

  const relevantParticipants = participants.filter((p) =>
    relevantParticipantIds.has(p.id),
  );
  const standings = calculateStandings(
    Array.from(relevantGames),
    relevantParticipants,
  );

  const selectedGroup = groups.find((g) => g.id.toString() === selectedGroupId);

  return (
    <>
      <StandingsSelector
        tournamentNames={tournamentNames}
        groups={groups}
        rounds={rounds}
        selectedTournamentId={selectedTournamentId}
        selectedGroupId={selectedGroupId}
        selectedRound={selectedRound}
      />

      <StandingsTable
        standings={standings}
        participants={participants}
        selectedGroup={selectedGroup}
        selectedGroupId={selectedGroupId}
        selectedTournamentId={selectedTournamentId}
        selectedRound={selectedRound}
      />
    </>
  );
}
