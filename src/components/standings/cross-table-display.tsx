import { CrossTable } from "./cross-table";
import { getCrossTable, resolveStandingsParams } from "@/services/standings";
import type { GroupSummary } from "@/db/types/group";

type Props = {
  groups: GroupSummary[];
  selectedGroupId: string;
  selectedRound?: string;
};

export async function CrossTableDisplay({
  groups,
  selectedGroupId,
  selectedRound,
}: Props) {
  const { groupId, round } = resolveStandingsParams(
    groups,
    selectedGroupId,
    selectedRound,
  );

  const crossTable = await getCrossTable(groupId, round);

  return (
    <CrossTable crossTable={crossTable} selectedGroupId={selectedGroupId} />
  );
}
