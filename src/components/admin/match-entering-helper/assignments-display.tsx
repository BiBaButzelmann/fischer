import { Badge } from "@/components/ui/badge";

type Props = {
  numberOfGroupsToEnter: number;
  assignedCount: number;
};

export function AssignmentsDisplay({
  numberOfGroupsToEnter,
  assignedCount,
}: Props) {
  return (
    <Badge>
      {assignedCount}/{numberOfGroupsToEnter}
    </Badge>
  );
}
