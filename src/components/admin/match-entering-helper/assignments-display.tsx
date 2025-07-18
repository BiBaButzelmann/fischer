import { Badge } from "@/components/ui/badge";

interface AssignmentsDisplayProps {
  numberOfGroupsToEnter: number;
  assignedCount: number;
}

export function AssignmentsDisplay({
  numberOfGroupsToEnter,
  assignedCount,
}: AssignmentsDisplayProps) {
  return (
    <Badge>
      {assignedCount}/{numberOfGroupsToEnter}
    </Badge>
  );
}
