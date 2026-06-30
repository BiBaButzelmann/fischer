import { StandingsTable } from "./standings-table";
import { getParticipantsInGroup } from "@/db/repositories/game";
import type { GroupSummary } from "@/db/types/group";
import { getStandings, resolveStandingsParams } from "@/services/standings";

type Props = {
  groups: GroupSummary[];
  selectedGroupId: string;
  selectedRound?: string;
};

export async function StandingsDisplay({
  groups,
  selectedGroupId,
  selectedRound,
}: Props) {
  const { groupId, round } = resolveStandingsParams(
    groups,
    selectedGroupId,
    selectedRound,
  );

  const participants = await getParticipantsInGroup(groupId);
  const standings = await getStandings(groupId, round);

  const selectedGroup = groups.find((g) => g.id.toString() === selectedGroupId);

  return (
    <StandingsTable
      standings={standings}
      participants={participants}
      selectedGroup={selectedGroup}
      selectedGroupId={selectedGroupId}
      selectedRound={selectedRound}
    />
  );
}
