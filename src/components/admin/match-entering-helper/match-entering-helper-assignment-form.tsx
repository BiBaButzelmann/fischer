"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Group } from "@/db/types/group";
import { useMemo, useState, useTransition } from "react";
import invariant from "tiny-invariant";
import { Trash } from "lucide-react";
import { MatchEnteringHelperWithName } from "@/db/types/match-entering-helper";
import { Badge } from "@/components/ui/badge";
import { updateMatchEnteringHelpers } from "@/actions/match-entering-helper";

type GroupId = number;
type MatchEnteringHelperId = number;

type Props = {
  tournamentId: number;
  groups: Group[];
  matchEnteringHelpers: MatchEnteringHelperWithName[];
  currentAssignments: Record<GroupId, MatchEnteringHelperWithName[]>;
};

export function MatchEnteringHelperAssignmentForm({
  tournamentId,
  groups,
  matchEnteringHelpers,
  currentAssignments,
}: Props) {
  const [assignments, setAssignments] =
    useState<Record<GroupId, MatchEnteringHelperWithName[]>>(
      currentAssignments,
    );
  const [isPending, startTransition] = useTransition();

  const matchEnteringHelperAssignedCount = useMemo(() => {
    return matchEnteringHelpers.reduce(
      (acc, helper) => {
        const assignedCount = Object.values(assignments).reduce(
          (acc, groupHelpers) => {
            return (
              acc + groupHelpers.filter((sh) => sh.id === helper.id).length
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

  const handleValueChange = (
    groupId: GroupId,
    matchEnteringHelperId: string,
  ) => {
    setAssignments((prev) => {
      const matchEnteringHelper = matchEnteringHelpers.find(
        (sh) => sh.id.toString() === matchEnteringHelperId,
      );
      invariant(matchEnteringHelper, "Match entering helper not found");

      if (prev[groupId] == null) {
        prev[groupId] = [];
      }
      const currentlyAssigned = prev[groupId];
      const currentlyAssignedIds = new Set(
        currentlyAssigned.map((sh) => sh.id),
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

  const handleDelete = (groupId: GroupId, matchEnteringHelperId: number) => {
    setAssignments((prev) => {
      const currentlyAssigned =
        prev[groupId]?.filter((sh) => sh.id !== matchEnteringHelperId) ?? [];
      return {
        ...prev,
        [groupId]: currentlyAssigned,
      };
    });
  };

  const handleSave = () => {
    startTransition(async () => {
      const groupedMatchEnteringHelperIds = Object.fromEntries(
        Object.entries(assignments).map(([groupId, helpers]) => [
          groupId,
          helpers.map((sh) => sh.id),
        ]),
      ) as Record<GroupId, number[]>;
      await updateMatchEnteringHelpers(
        tournamentId,
        groupedMatchEnteringHelperIds,
      );
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6">
        {groups.map((group) => (
          <div key={group.id}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {group.groupName} ({group.groupNumber})
              </label>
              <Select
                value=""
                onValueChange={(value) => handleValueChange(group.id, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Aufbauhelfer hinzufügen..." />
                </SelectTrigger>
                <SelectContent>
                  {matchEnteringHelpers.map((matchEnteringHelper) => (
                    <SelectItem
                      key={matchEnteringHelper.id}
                      value={matchEnteringHelper.id.toString()}
                      className="flex items-center justify-between"
                    >
                      {matchEnteringHelper.profile.firstName}{" "}
                      {matchEnteringHelper.profile.lastName}{" "}
                      <div className="flex gap-1">
                        <AssignmentsDisplay
                          numberOfGroupsToEnter={
                            matchEnteringHelper.numberOfGroupsToEnter
                          }
                          assignedCount={
                            matchEnteringHelperAssignedCount[
                              matchEnteringHelper.id
                            ] ?? 0
                          }
                        />
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mt-2">
              {assignments[group.id] != null
                ? assignments[group.id].map((sh) => (
                    <div
                      key={sh.id}
                      className="px-2 py-2 bg-gray-100 rounded mb-1"
                    >
                      <MatchEnteringHelperEntry
                        matchEnteringHelper={sh}
                        assignedCount={
                          matchEnteringHelperAssignedCount[sh.id] ?? 0
                        }
                        onDelete={() => handleDelete(group.id, sh.id)}
                      />
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

function AssignmentsDisplay({
  numberOfGroupsToEnter,
  assignedCount,
}: {
  numberOfGroupsToEnter: number;
  assignedCount: number;
}) {
  return (
    <Badge>
      {numberOfGroupsToEnter} ({assignedCount})
    </Badge>
  );
}

function MatchEnteringHelperEntry({
  matchEnteringHelper,
  assignedCount,
  onDelete,
}: {
  matchEnteringHelper: MatchEnteringHelperWithName;
  assignedCount: number;
  onDelete: () => void;
}) {
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
