import { useState } from "react";
import { RefereeWithName } from "@/db/types/referee";

export function useRefereeAssignments(
  initialAssignments: Record<number, RefereeWithName | null>,
  referees: RefereeWithName[],
) {
  const [assignments, setAssignments] =
    useState<Record<number, RefereeWithName | null>>(initialAssignments);

  const updateRefereeAssignment = (
    matchdayId: number,
    refereeId: string | null,
  ) => {
    setAssignments((prev) => ({
      ...prev,
      [matchdayId]:
        refereeId === "none" || !refereeId
          ? null
          : referees.find((r) => r.id.toString() === refereeId) || null,
    }));
  };

  const getAssignmentsByMatchday = () => {
    return Object.fromEntries(
      Object.entries(assignments).map(([matchdayId, referee]) => [
        matchdayId,
        referee ? referee.id : null,
      ]),
    ) as Record<number, number | null>;
  };

  return {
    assignments,
    updateRefereeAssignment,
    getAssignmentsByMatchday,
  };
}
