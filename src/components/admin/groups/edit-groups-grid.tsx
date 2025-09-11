"use client";

import { ParticipantWithName } from "@/db/types/participant";
import { GroupsGrid } from "./groups-grid";
import { useEffect, useState, useTransition } from "react";
import { GridGroup } from "./types";
import { Button } from "@/components/ui/button";
import { saveGroups } from "@/actions/group";
import { MatchEnteringHelperWithName } from "@/db/types/match-entering-helper";
import { useHelperAssignments } from "@/hooks/useHelperAssignments";
import { toast } from "sonner";
import { NUMBER_OF_GROUPS_WITH_ELO } from "@/constants/constants";
import invariant from "tiny-invariant";
import { isError } from "@/lib/actions";
import { sortParticipantsByElo, sortParticipantsByDwz } from "@/lib/elo";

export function EditGroupsGrid({
  tournamentId,
  groups: initialGroups,
  unassignedParticipants: initialUnassignedParticipants,
  matchEnteringHelpers,
  currentAssignments,
}: {
  tournamentId: number;
  groups: GridGroup[];
  unassignedParticipants: ParticipantWithName[];
  matchEnteringHelpers: MatchEnteringHelperWithName[];
  currentAssignments: Record<number, MatchEnteringHelperWithName[]>;
}) {
  const [isPending, startTransition] = useTransition();

  const [unassignedParticipants, setUnassignedParticipants] = useState(
    initialUnassignedParticipants,
  );
  const [gridGroups, setGridGroups] = useState(initialGroups);

  useEffect(() => {
    setGridGroups(initialGroups);
    setUnassignedParticipants(initialUnassignedParticipants);
  }, [initialGroups, initialUnassignedParticipants]);

  const {
    assignments: helperAssignments,
    helperAssignedCounts,
    addHelperToGroup,
    removeHelperFromGroup,
  } = useHelperAssignments(currentAssignments, matchEnteringHelpers);

  const handleDistributeParticipants = (participantsPerGroup: number) => {
    const targetSize = Math.floor(participantsPerGroup);
    if (!Number.isFinite(targetSize) || targetSize <= 0) {
      toast.error("Ungültige Zielgröße für Gruppen");
      return;
    }

    const { updatedGroups, newUnassigned, assignedParticipants } =
      distributeParticipants({
        groups: gridGroups,
        unassigned: unassignedParticipants,
        participantsPerGroup: targetSize,
        eloGroupCount: NUMBER_OF_GROUPS_WITH_ELO,
      });

    setGridGroups(updatedGroups);
    setUnassignedParticipants(newUnassigned);

    toast.success(
      `${assignedParticipants.length} Teilnehmer verteilt. ${newUnassigned.length} verbleiben.`,
    );
  };

  const handleAddNewGroup = async () => {
    const nonDeletedGroups = gridGroups.filter((g) => !g.isDeleted);
    const groupNumbers = nonDeletedGroups.map((g) => g.groupNumber);

    let nextGroupNumber = 1;
    while (groupNumbers.includes(nextGroupNumber)) {
      nextGroupNumber++;
    }

    const newGroup: GridGroup = {
      id: Date.now(),
      isNew: true,
      isDeleted: false,
      groupNumber: nextGroupNumber,
      groupName: generateGroupName(nextGroupNumber),
      dayOfWeek: null,
      participants: [],
      matchEnteringHelpers: [],
    };

    setGridGroups((prev) => [...prev, newGroup]);
  };

  const handleDeleteGroup = (groupId: number) => {
    const newGroups = [...gridGroups];

    const groupIndex = gridGroups.findIndex((g) => g.id === groupId);
    invariant(groupIndex !== -1, "Group not found");

    const deletedGroup = gridGroups[groupIndex];

    if (gridGroups[groupIndex].isNew) {
      setGridGroups((prev) => prev.filter((g) => g.id !== groupId));
    } else {
      newGroups[groupIndex].isDeleted = true;
      setGridGroups(newGroups);
    }

    setUnassignedParticipants([
      ...unassignedParticipants,
      ...deletedGroup.participants,
    ]);
  };

  const handleUpdateGroupName = (groupId: number, newName: string) => {
    const updatedGroups = gridGroups.map((g) =>
      g.id === groupId ? { ...g, groupName: newName } : g,
    );
    setGridGroups(updatedGroups);
  };

  const handleAddHelperToGroup = (groupId: number, helperId: number) => {
    const groupIndex = gridGroups.findIndex((g) => g.id === groupId);
    invariant(groupIndex !== -1, "Group not found");

    const group = gridGroups[groupIndex];
    if (group.matchEnteringHelpers.find((h) => h.id === helperId)) {
      return;
    }

    const matchEnteringHelper = matchEnteringHelpers.find(
      (h) => h.id === helperId,
    );
    invariant(matchEnteringHelper, "Match entering helper not found");

    const updatedGroups = [...gridGroups];
    updatedGroups[groupIndex].matchEnteringHelpers.push(matchEnteringHelper);

    setGridGroups(updatedGroups);
    addHelperToGroup(groupId, helperId);
  };

  const handleRemoveHelperFromGroup = (groupId: number, helperId: number) => {
    const groupIndex = gridGroups.findIndex((g) => g.id === groupId);
    invariant(groupIndex !== -1, "Group not found");

    const updatedGroups = [...gridGroups];
    updatedGroups[groupIndex].matchEnteringHelpers = updatedGroups[
      groupIndex
    ].matchEnteringHelpers.filter((h) => h.id !== helperId);

    setGridGroups(updatedGroups);
    removeHelperFromGroup(groupId, helperId);
  };

  const handleSaveChanges = () => {
    startTransition(async () => {
      const result = await saveGroups(tournamentId, gridGroups);
      if (isError(result)) {
        toast.error(result.error);
      } else {
        toast.success("Änderungen erfolgreich gespeichert");
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end gap-4 items-center">
        <Button
          variant="outline"
          onClick={handleAddNewGroup}
          disabled={isPending}
        >
          Gruppe hinzufügen
        </Button>
        <Button onClick={handleSaveChanges} disabled={isPending}>
          Änderungen speichern
        </Button>
      </div>
      <div className={isPending ? "opacity-50 pointer-events-none" : ""}>
        <GroupsGrid
          tournamentId={tournamentId}
          groups={gridGroups}
          unassignedParticipants={unassignedParticipants}
          matchEnteringHelpers={matchEnteringHelpers}
          helperAssignedCounts={helperAssignedCounts}
          helperAssignments={helperAssignments}
          onChangeGroups={setGridGroups}
          onChangeUnassignedParticipants={setUnassignedParticipants}
          onDeleteGroup={handleDeleteGroup}
          onUpdateGroupName={handleUpdateGroupName}
          onAddHelperToGroup={handleAddHelperToGroup}
          onRemoveHelperFromGroup={handleRemoveHelperFromGroup}
          onDistributeParticipants={handleDistributeParticipants}
        />
      </div>
    </div>
  );
}

function generateGroupName(groupNumber: number): string {
  if (groupNumber === 1) {
    return "A";
  }

  // For groups 2+, calculate which letter group and which number within that group
  // Groups 2,3,4 -> B1,B2,B3 (letter B = 2nd letter)
  // Groups 5,6,7 -> C1,C2,C3 (letter C = 3rd letter)
  // etc.
  const letterIndex = Math.floor((groupNumber - 2) / 3) + 2; // Start from B (2nd letter)
  const numberWithinLetter = ((groupNumber - 2) % 3) + 1; // 1, 2, or 3

  const letter = String.fromCharCode(64 + letterIndex);
  return `${letter}${numberWithinLetter}`;
}

function distributeParticipants({
  groups,
  unassigned,
  participantsPerGroup,
  eloGroupCount,
}: {
  groups: GridGroup[];
  unassigned: ParticipantWithName[];
  participantsPerGroup: number;
  eloGroupCount: number;
}) {
  const updatedGroups: GridGroup[] = [];
  const assigned: ParticipantWithName[] = [];

  const remainingIds = new Set(unassigned.map((p) => p.id));

  const eloOrderedAll = sortParticipantsByElo(unassigned);
  const dwzOrderedAll = sortParticipantsByDwz(unassigned);

  function takeFromOrdered(
    source: ParticipantWithName[],
    n: number,
  ): ParticipantWithName[] {
    if (n <= 0 || remainingIds.size === 0) return [];
    const picked: ParticipantWithName[] = [];
    for (const p of source) {
      if (!remainingIds.has(p.id)) continue;
      picked.push(p);
      remainingIds.delete(p.id);
      if (picked.length === n) break;
    }
    return picked;
  }

  let activeGroupIndex = 0;
  for (const group of groups) {
    if (group.isDeleted) {
      updatedGroups.push(group);
      continue;
    }

    const currentParticipantsCount = group.participants.length;
    const participantsNeeded = participantsPerGroup - currentParticipantsCount;
    if (participantsNeeded <= 0) {
      updatedGroups.push(group);
      activeGroupIndex++;
      continue;
    }

    const ordering =
      activeGroupIndex < eloGroupCount ? eloOrderedAll : dwzOrderedAll;
    const toAdd = takeFromOrdered(ordering, participantsNeeded);
    if (toAdd.length > 0) {
      assigned.push(...toAdd);
      updatedGroups.push({
        ...group,
        participants: [...group.participants, ...toAdd],
      });
    } else {
      updatedGroups.push(group);
    }
    activeGroupIndex++;
  }

  const newUnassigned = unassigned.filter((p) => remainingIds.has(p.id));

  return { updatedGroups, newUnassigned, assignedParticipants: assigned };
}
