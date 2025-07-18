"use client";

import { Button } from "@/components/ui/button";
import { Group } from "@/db/types/group";
import { useTransition } from "react";
import { MatchEnteringHelperWithName } from "@/db/types/match-entering-helper";
import { updateMatchEnteringHelpers } from "@/actions/match-entering-helper";
import { useHelperAssignments } from "@/hooks/useHelperAssignments";
import { GroupAssignmentCard } from "./group-assignment-card";

type Props = {
  tournamentId: number;
  groups: Group[];
  matchEnteringHelpers: MatchEnteringHelperWithName[];
  currentAssignments: Record<number, MatchEnteringHelperWithName[]>;
};

export function MatchEnteringHelperAssignmentForm({
  tournamentId,
  groups,
  matchEnteringHelpers,
  currentAssignments,
}: Props) {
  const [isPending, startTransition] = useTransition();

  const {
    assignments,
    helperAssignedCounts,
    addHelperToGroup,
    removeHelperFromGroup,
    getGroupedHelperIds,
  } = useHelperAssignments(currentAssignments, matchEnteringHelpers);

  const handleSave = () => {
    startTransition(async () => {
      await updateMatchEnteringHelpers(tournamentId, getGroupedHelperIds());
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6">
        {groups.map((group) => (
          <GroupAssignmentCard
            key={group.id}
            group={group}
            matchEnteringHelpers={matchEnteringHelpers}
            assignedHelpers={assignments[group.id] ?? []}
            helperAssignedCounts={helperAssignedCounts}
            onAddHelper={(helperId) => addHelperToGroup(group.id, helperId)}
            onRemoveHelper={(helperId) =>
              removeHelperFromGroup(group.id, helperId)
            }
          />
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? "Speichern..." : "Speichern"}
        </Button>
      </div>
    </div>
  );
}
