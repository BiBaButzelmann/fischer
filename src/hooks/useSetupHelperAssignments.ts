import { useState } from "react";
import { DayOfWeek } from "@/db/types/group";
import { SetupHelperWithName } from "@/db/types/setup-helper";
import invariant from "tiny-invariant";

export function useSetupHelperAssignments(
  initialAssignments: Record<DayOfWeek, SetupHelperWithName[]>,
  setupHelpers: SetupHelperWithName[],
) {
  const [assignments, setAssignments] =
    useState<Record<DayOfWeek, SetupHelperWithName[]>>(initialAssignments);

  const addHelperToDay = (day: DayOfWeek, setupHelperId: string) => {
    setAssignments((prev) => {
      const setupHelper = setupHelpers.find(
        (helper) => helper.id.toString() === setupHelperId,
      );
      invariant(setupHelper, "Setup helper not found");

      if (prev[day] == null) {
        prev[day] = [];
      }
      const currentlyAssigned = prev[day];
      const currentlyAssignedIds = new Set(
        currentlyAssigned.map((helper) => helper.id),
      );

      if (!currentlyAssignedIds.has(setupHelper.id)) {
        currentlyAssigned.push(setupHelper);
      }

      return {
        ...prev,
        [day]: Array.from(currentlyAssigned),
      };
    });
  };

  const removeHelperFromDay = (day: DayOfWeek, setupHelperId: number) => {
    setAssignments((prev) => {
      const currentlyAssigned =
        prev[day]?.filter((helper) => helper.id !== setupHelperId) ?? [];
      return {
        ...prev,
        [day]: currentlyAssigned,
      };
    });
  };

  const getGroupedHelperIds = () => {
    return Object.fromEntries(
      Object.entries(assignments).map(([day, helpers]) => [
        day,
        helpers.map((helper) => helper.id.toString()),
      ]),
    ) as Record<DayOfWeek, string[]>;
  };

  return {
    assignments,
    addHelperToDay,
    removeHelperFromDay,
    getGroupedHelperIds,
  };
}
