import { StandingsSelector } from "./standings-selector";
import { StandingsTable } from "./standings-table";
import { getParticipantsInGroup } from "@/db/repositories/game";
import type { GroupSummary } from "@/db/types/group";
import { getStandings } from "@/services/standings";

type Props = {
  groups: GroupSummary[];
  rounds: number[];
  selectedGroupId: string;
  selectedRound?: string;
};

export async function StandingsDisplay({
  groups,
  rounds,
  selectedGroupId,
  selectedRound,
}: Props) {
  const parsedGroupId = Number(selectedGroupId);
  const groupId = Number.isNaN(parsedGroupId) ? groups[0].id : parsedGroupId;
  const round = selectedRound != null ? Number(selectedRound) : undefined;

  const participants = await getParticipantsInGroup(groupId);
  const standings = await getStandings(groupId, round);

  const selectedGroup = groups.find((g) => g.id.toString() === selectedGroupId);

  return (
    <>
      <StandingsSelector
        groups={groups}
        rounds={rounds}
        selectedGroupId={selectedGroupId}
        selectedRound={selectedRound}
      />

      <StandingsTable
        standings={standings}
        participants={participants}
        selectedGroup={selectedGroup}
        selectedGroupId={selectedGroupId}
        selectedRound={selectedRound}
      />
    </>
  );
}
