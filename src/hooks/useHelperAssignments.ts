import { useState, useMemo } from "react";
import { MatchEnteringHelperWithName } from "@/db/types/match-entering-helper";
import invariant from "tiny-invariant";

type GroupId = number;
type MatchEnteringHelperId = number;

export function useHelperAssignments(
  initialAssignments: Record<GroupId, MatchEnteringHelperWithName[]>,
  matchEnteringHelpers: MatchEnteringHelperWithName[],
) {
  const [assignments, setAssignments] =
    useState<Record<GroupId, MatchEnteringHelperWithName[]>>(
      initialAssignments,
    );

  const helperAssignedCounts = useMemo(() => {
    return matchEnteringHelpers.reduce(
      (acc, helper) => {
        const assignedCount = Object.values(assignments).reduce(
          (count, groupHelpers) => {
            return (
              count + groupHelpers.filter((h) => h.id === helper.id).length
            );
          },
          0,
        );
        acc[helper.id] = assignedCount;
        return acc;
      },
      {} as Record<MatchEnteringHelperId, number>,
    );
  }, [assignments, matchEnteringHelpers]);

  const addHelperToGroup = (
    groupId: GroupId,
    matchEnteringHelperId: string,
  ) => {
    setAssignments((prev) => {
      const matchEnteringHelper = matchEnteringHelpers.find(
        (helper) => helper.id.toString() === matchEnteringHelperId,
      );
      invariant(matchEnteringHelper, "Match entering helper not found");

      if (prev[groupId] == null) {
        prev[groupId] = [];
      }
      const currentlyAssigned = prev[groupId];
      const currentlyAssignedIds = new Set(
        currentlyAssigned.map((helper) => helper.id),
      );

      if (!currentlyAssignedIds.has(matchEnteringHelper.id)) {
        currentlyAssigned.push(matchEnteringHelper);
      }

      return {
        ...prev,
        [groupId]: Array.from(currentlyAssigned),
      };
    });
  };

  const removeHelperFromGroup = (
    groupId: GroupId,
    matchEnteringHelperId: number,
  ) => {
    setAssignments((prev) => {
      const currentlyAssigned =
        prev[groupId]?.filter(
          (helper) => helper.id !== matchEnteringHelperId,
        ) ?? [];
      return {
        ...prev,
        [groupId]: currentlyAssigned,
      };
    });
  };

  const getGroupedHelperIds = () => {
    return Object.fromEntries(
      Object.entries(assignments).map(([groupId, helpers]) => [
        groupId,
        helpers.map((helper) => helper.id),
      ]),
    ) as Record<GroupId, number[]>;
  };

  return {
    assignments,
    helperAssignedCounts,
    addHelperToGroup,
    removeHelperFromGroup,
    getGroupedHelperIds,
  };
}
