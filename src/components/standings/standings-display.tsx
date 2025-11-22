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
import invariant from "tiny-invariant";
import { didParticipantForfeitGame } from "@/lib/game";

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

  const participantsMap = Object.fromEntries(
    participants.map((p) => [p.id, p]),
  );
  const gamesPlayedPerParticipant = games.reduce(
    (acc, game) => {
      const { whiteParticipantId, blackParticipantId } = game;

      if (whiteParticipantId == null || blackParticipantId == null) {
        return acc;
      }

      const whiteParticipant = participantsMap[whiteParticipantId];
      const blackParticipant = participantsMap[blackParticipantId];

      // consider a game not played for deleted participants based on the result
      if (
        whiteParticipant.deletedAt == null ||
        !didParticipantForfeitGame(whiteParticipantId, game)
      ) {
        if (!acc[whiteParticipantId]) {
          acc[whiteParticipantId] = [];
        }
        acc[whiteParticipantId].push(game);
      }
      if (
        blackParticipant.deletedAt == null ||
        !didParticipantForfeitGame(blackParticipantId, game)
      ) {
        if (!acc[blackParticipantId]) {
          acc[blackParticipantId] = [];
        }
        acc[blackParticipantId].push(game);
      }

      return acc;
    },
    {} as Record<number, GameWithMatchday[]>,
  );

  const activeParticipants = new Set(
    participants.filter((p) => p.deletedAt == null).map((p) => p.id),
  );
  const inactiveParticipants = new Set(
    participants.filter((p) => p.deletedAt != null).map((p) => p.id),
  );

  const totalGamesToPlay = participants.length - 1;
  const relevantGames: Set<Game> = new Set();

  // add all games to list except if one of the participants is inactive and has played less than 50% of their games
  for (const game of games) {
    const { whiteParticipantId, blackParticipantId } = game;
    invariant(
      whiteParticipantId != null && blackParticipantId != null,
      "Both participants must be defined",
    );

    if (
      activeParticipants.has(whiteParticipantId) &&
      activeParticipants.has(blackParticipantId)
    ) {
      relevantGames.add(game);
      continue;
    }

    let isRelevant = true;
    if (inactiveParticipants.has(whiteParticipantId)) {
      const gamesPlayed = gamesPlayedPerParticipant[whiteParticipantId] || [];
      const gamesPlayedCount = gamesPlayed.length;
      if (gamesPlayedCount / totalGamesToPlay < 0.5) {
        isRelevant = false;
      }
    }
    if (inactiveParticipants.has(blackParticipantId)) {
      const gamesPlayed = gamesPlayedPerParticipant[blackParticipantId] || [];
      const gamesPlayedCount = gamesPlayed.length;
      if (gamesPlayedCount / totalGamesToPlay < 0.5) {
        isRelevant = false;
      }
    }

    if (isRelevant) {
      relevantGames.add(game);
    }
  }

  const standings = calculateStandings(Array.from(relevantGames), participants);

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
