import { StandingsSelector } from "./standings-selector";
import { StandingsTable } from "./standings-table";
import { getParticipantsInGroup } from "@/db/repositories/game";
import type { TournamentNames } from "@/db/types/tournament";
import type { GroupSummary } from "@/db/types/group";
import { getStandings } from "@/services/standings";

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
  const groupId = Number(selectedGroupId);
  const round = selectedRound != null ? Number(selectedRound) : undefined;

  const participants = await getParticipantsInGroup(groupId);
  const standings = await getStandings(groupId, round);

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
