"use client";

import { updateSetupHelpers } from "@/actions/match-day";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { matchDays } from "@/constants/constants";
import { availableMatchDays } from "@/db/schema/columns.helpers";
import { DayOfWeek } from "@/db/types/group";
import { SetupHelperWithName } from "@/db/types/setup-helper";
import { useState, useTransition } from "react";
import invariant from "tiny-invariant";

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
  const [assignments, setAssignments] =
    useState<Record<DayOfWeek, SetupHelperWithName[]>>(currentAssignments);
  const [isPending, startTransition] = useTransition();

  const handleValueChange = (day: DayOfWeek, setupHelperId: string) => {
    setAssignments((prev) => {
      const setupHelper = setupHelpers.find(
        (sh) => sh.id.toString() === setupHelperId,
      );
      invariant(setupHelper, "Setup helper not found");

      if (prev[day] == null) {
        prev[day] = [];
      }
      const currentlyAssigned = new Set(prev[day]);
      currentlyAssigned.add(setupHelper);

      return {
        ...prev,
        [day]: Array.from(currentlyAssigned),
      };
    });
  };

  const handleSave = () => {
    startTransition(async () => {
      const groupedSetupHelperIds = Object.fromEntries(
        Object.entries(assignments).map(([day, helpers]) => [
          day,
          helpers.map((sh) => sh.id.toString()),
        ]),
      ) as Record<DayOfWeek, string[]>;
      await updateSetupHelpers(tournamentId, groupedSetupHelperIds);
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {availableMatchDays.map((day) => (
          <div key={day}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {matchDays[day]}
              </label>
              <Select
                value=""
                onValueChange={(value) => handleValueChange(day, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Aufbauhelfer hinzufügen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aufbauhelfer hinzufügen</SelectItem>
                  {setupHelpers.map((setupHelper) => (
                    <SelectItem
                      key={setupHelper.id}
                      value={setupHelper.id.toString()}
                    >
                      {setupHelper.profile.firstName}{" "}
                      {setupHelper.profile.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mt-2 ml-2 space-y-1">
              {assignments[day] != null
                ? assignments[day].map((sh) => (
                    <div key={sh.id}>
                      <span>
                        {sh.profile.firstName} {sh.profile.lastName}
                      </span>
                    </div>
                  ))
                : null}
            </div>
          </div>
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
