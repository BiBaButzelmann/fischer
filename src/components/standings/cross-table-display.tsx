import { CrossTable } from "./cross-table";
import { getCrossTable } from "@/services/standings";
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
  const parsedGroupId = Number(selectedGroupId);
  const groupId = Number.isNaN(parsedGroupId) ? groups[0].id : parsedGroupId;
  const parsedRound = Number(selectedRound);
  const round =
    selectedRound && Number.isFinite(parsedRound) && parsedRound > 0
      ? parsedRound
      : undefined;

  const crossTable = await getCrossTable(groupId, round);

  return (
    <CrossTable crossTable={crossTable} selectedGroupId={selectedGroupId} />
  );
}
