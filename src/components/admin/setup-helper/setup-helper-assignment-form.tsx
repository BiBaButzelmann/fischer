"use client";

import { updateSetupHelpers } from "@/actions/match-day";
import { Button } from "@/components/ui/button";
import { availableMatchDays } from "@/db/schema/columns.helpers";
import { DayOfWeek } from "@/db/types/group";
import { SetupHelperWithName } from "@/db/types/setup-helper";
import { useTransition } from "react";
import { useSetupHelperAssignments } from "@/hooks/useSetupHelperAssignments";
import { DayAssignmentCard } from "./day-assignment-card";

type Props = {
  tournamentId: number;
  setupHelpers: SetupHelperWithName[];
  currentAssignments: Record<DayOfWeek, SetupHelperWithName[]>;
};

export function SetupHelperAssignmentForm({
  tournamentId,
  setupHelpers,
  currentAssignments,
}: Props) {
  const [isPending, startTransition] = useTransition();

  const {
    assignments,
    addHelperToDay,
    removeHelperFromDay,
    getGroupedHelperIds,
  } = useSetupHelperAssignments(currentAssignments, setupHelpers);

  const handleSave = () => {
    startTransition(async () => {
      await updateSetupHelpers(tournamentId, getGroupedHelperIds());
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {availableMatchDays.map((day) => (
          <DayAssignmentCard
            key={day}
            day={day}
            setupHelpers={setupHelpers}
            assignedHelpers={assignments[day] ?? []}
            onAddHelper={(helperId) => addHelperToDay(day, helperId)}
            onRemoveHelper={(helperId) => removeHelperFromDay(day, helperId)}
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
