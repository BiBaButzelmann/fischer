import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MatchEnteringHelperWithName } from "@/db/types/match-entering-helper";
import { AssignmentsDisplay } from "./assignments-display";

interface MatchEnteringHelperSelectorProps {
  matchEnteringHelpers: MatchEnteringHelperWithName[];
  helperAssignedCounts: Record<number, number>;
  onSelect: (value: string) => void;
}

export function MatchEnteringHelperSelector({
  matchEnteringHelpers,
  helperAssignedCounts,
  onSelect,
}: MatchEnteringHelperSelectorProps) {
  return (
    <Select value="" onValueChange={onSelect}>
      <SelectTrigger>
        <SelectValue placeholder="Aufbauhelfer hinzufügen..." />
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
  );
}
