import { useState } from "react";
import { SetupHelperWithName } from "@/db/types/setup-helper";
import invariant from "tiny-invariant";

export function useSetupHelperAssignments(
  initialAssignments: Record<number, SetupHelperWithName[]>,
  setupHelpers: SetupHelperWithName[],
) {
  const [assignments, setAssignments] =
    useState<Record<number, SetupHelperWithName[]>>(initialAssignments);

  const addHelperToMatchday = (matchdayId: number, setupHelperId: string) => {
    setAssignments((prev) => {
      const setupHelper = setupHelpers.find(
        (helper) => helper.id.toString() === setupHelperId,
      );
      invariant(setupHelper, "Setup helper not found");

      if (prev[matchdayId] == null) {
        prev[matchdayId] = [];
      }
      const currentlyAssigned = prev[matchdayId];
      const currentlyAssignedIds = new Set(
        currentlyAssigned.map((helper) => helper.id),
      );

      if (!currentlyAssignedIds.has(setupHelper.id)) {
        currentlyAssigned.push(setupHelper);
      }

      return {
        ...prev,
        [matchdayId]: Array.from(currentlyAssigned),
      };
    });
  };

  const removeHelperFromMatchday = (
    matchdayId: number,
    setupHelperId: number,
  ) => {
    setAssignments((prev) => {
      const currentlyAssigned =
        prev[matchdayId]?.filter((helper) => helper.id !== setupHelperId) ?? [];
      return {
        ...prev,
        [matchdayId]: currentlyAssigned,
      };
    });
  };

  const getAssignmentsByMatchday = () => {
    return Object.fromEntries(
      Object.entries(assignments).map(([matchdayId, helpers]) => [
        matchdayId,
        helpers.map((helper) => helper.id),
      ]),
    ) as Record<number, number[]>;
  };

  return {
    assignments,
    addHelperToMatchday,
    removeHelperFromMatchday,
    getAssignmentsByMatchday,
  };
}
