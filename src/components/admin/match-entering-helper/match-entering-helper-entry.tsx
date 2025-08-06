import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { MatchEnteringHelperWithName } from "@/db/types/match-entering-helper";
import { AssignmentsDisplay } from "./assignments-display";

type Props = {
  matchEnteringHelper: MatchEnteringHelperWithName;
  assignedCount: number;
  onDelete: () => void;
};

export function MatchEnteringHelperEntry({
  matchEnteringHelper,
  assignedCount,
  onDelete,
}: Props) {
  return (
    <div className="flex items-center">
      <span className="inline-flex flex-1">
        {matchEnteringHelper.profile.firstName}{" "}
        {matchEnteringHelper.profile.lastName}
      </span>
      <AssignmentsDisplay
        numberOfGroupsToEnter={matchEnteringHelper.numberOfGroupsToEnter}
        assignedCount={assignedCount}
      />
      <Button variant="outline" size="icon" className="ml-2" onClick={onDelete}>
        <Trash />
      </Button>
    </div>
  );
}
