import { MatchEnteringHelperWithName } from "@/db/types/match-entering-helper";
import { MatchEnteringHelperEntry } from "./match-entering-helper-entry";
import { AssignmentsDisplay } from "./assignments-display";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  matchEnteringHelpers: MatchEnteringHelperWithName[];
  assignedHelpers: MatchEnteringHelperWithName[];
  helperAssignedCounts: Record<number, number>;
  onAddHelper: (helperId: number) => void;
  onRemoveHelper: (helperId: number) => void;
};

export function GroupMatchEnteringHelperSelector({
  matchEnteringHelpers,
  assignedHelpers,
  helperAssignedCounts,
  onAddHelper,
  onRemoveHelper,
}: Props) {
  return (
    <div className="space-y-2">
      <Select value="" onValueChange={(v) => onAddHelper(parseInt(v))}>
        <SelectTrigger>
          <SelectValue placeholder="Eingabehelfer hinzufügen..." />
        </SelectTrigger>
        <SelectContent>
          {matchEnteringHelpers.map((helper) => (
            <SelectItem
              key={helper.id}
              value={helper.id.toString()}
              className="flex items-center justify-between"
            >
              {helper.profile.firstName} {helper.profile.lastName}{" "}
              <div className="flex gap-1">
                <AssignmentsDisplay
                  numberOfGroupsToEnter={helper.numberOfGroupsToEnter}
                  assignedCount={helperAssignedCounts[helper.id] ?? 0}
                />
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {assignedHelpers.length > 0 && (
        <div className="space-y-1">
          {assignedHelpers.map((helper) => (
            <div
              key={helper.id}
              className="px-2 py-1 bg-gray-50 rounded text-xs"
            >
              <MatchEnteringHelperEntry
                matchEnteringHelper={helper}
                assignedCount={helperAssignedCounts[helper.id] ?? 0}
                onDelete={() => onRemoveHelper(helper.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
