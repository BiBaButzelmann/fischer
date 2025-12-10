import { StandingsSelector } from "./standings-selector";
import { StandingsTable } from "./standings-table";
import {
  getParticipantsInGroup,
  getCompletedGames,
} from "@/db/repositories/game";
import { calculateStandings } from "@/lib/standings";
import { filterRelevantGames } from "@/lib/relevant-games";
import type { TournamentNames } from "@/db/types/tournament";
import type { GroupSummary } from "@/db/types/group";

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

  const relevantGames = filterRelevantGames(games, participants);
  const standings = calculateStandings(relevantGames, participants);

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
