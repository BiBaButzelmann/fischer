import { GroupBadge } from "@/components/ui/group-badge";

type Props = {
  groups: { id: number; groupName: string }[];
};

export function AssignedGroups({ groups }: Props) {
  if (groups.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <p className="text-sm text-slate-600 mb-3">
        Zugewiesene Gruppen{" "}
        <span className="text-slate-500">(+ eigene Partien)</span>:
      </p>
      <div className="flex flex-wrap gap-3">
        {groups.map((group) => (
          <GroupBadge key={group.id} groupName={group.groupName} />
        ))}
      </div>
    </div>
  );
}
