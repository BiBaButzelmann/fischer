import { Group } from "@/db/types/group";
import { MatchEnteringHelperWithName } from "@/db/types/match-entering-helper";
import { MatchEnteringHelperSelector } from "./match-entering-helper-selector";
import { MatchEnteringHelperEntry } from "./match-entering-helper-entry";

interface GroupAssignmentCardProps {
  group: Group;
  matchEnteringHelpers: MatchEnteringHelperWithName[];
  assignedHelpers: MatchEnteringHelperWithName[];
  helperAssignedCounts: Record<number, number>;
  onAddHelper: (helperId: string) => void;
  onRemoveHelper: (helperId: number) => void;
}

export function GroupAssignmentCard({
  group,
  matchEnteringHelpers,
  assignedHelpers,
  helperAssignedCounts,
  onAddHelper,
  onRemoveHelper,
}: GroupAssignmentCardProps) {
  return (
    <div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          {group.groupName} ({group.groupNumber})
        </label>
        <MatchEnteringHelperSelector
          matchEnteringHelpers={matchEnteringHelpers}
          helperAssignedCounts={helperAssignedCounts}
          onSelect={(value) => onAddHelper(value)}
        />
      </div>
      <div className="mt-2">
        {assignedHelpers.map((helper) => (
          <div key={helper.id} className="px-2 py-2 bg-gray-100 rounded mb-1">
            <MatchEnteringHelperEntry
              matchEnteringHelper={helper}
              assignedCount={helperAssignedCounts[helper.id] ?? 0}
              onDelete={() => onRemoveHelper(helper.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
