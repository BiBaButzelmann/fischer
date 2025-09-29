import { getAssignedGroupsByMatchEnteringHelperId } from "@/db/repositories/match-entering-helper";
import { GroupBadge } from "@/components/ui/group-badge";

type Props = {
  matchEnteringHelperId: number;
};

export async function AssignedGroups({ matchEnteringHelperId }: Props) {
  const assignedGroupsData = await getAssignedGroupsByMatchEnteringHelperId(
    matchEnteringHelperId,
  );

  if (assignedGroupsData.length === 0) {
    return null;
  }

  const assignedGroups = assignedGroupsData.map((item) => ({
    id: item.group.id,
    groupName: item.group.groupName,
  }));

  return (
    <div className="mt-4">
      <p className="text-sm text-slate-600 mb-3">
        Zugewiesene Gruppen{" "}
        <span className="text-slate-500">(+ eigene Partien)</span>:
      </p>
      <div className="flex flex-wrap gap-3">
        {assignedGroups.map((group) => (
          <GroupBadge key={group.id} groupName={group.groupName} />
        ))}
      </div>
    </div>
  );
}
