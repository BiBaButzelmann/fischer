"use client";

import { ParticipantWithName } from "@/db/types/participant";
import { GroupsGrid } from "./groups-grid";
import { useEffect, useState, useTransition } from "react";
import { GridGroup } from "./types";
import { Button } from "@/components/ui/button";
import {
  saveGroup,
  deleteGroup,
  updateGroupName,
  getExistingGroupNumbers,
} from "@/actions/group";
import { MatchEnteringHelperWithName } from "@/db/types/match-entering-helper";
import { useHelperAssignments } from "@/hooks/useHelperAssignments";
import { updateMatchEnteringHelpers } from "@/actions/match-entering-helper";
import { toast } from "sonner";
import { NUMBER_OF_GROUPS_WITH_ELO } from "@/constants/constants";

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
  }, [initialGroups]);

  const {
    assignments: helperAssignments,
    helperAssignedCounts,
    addHelperToGroup,
    removeHelperFromGroup,
    getMatchEnteringHelpersForGroup,
  } = useHelperAssignments(currentAssignments, matchEnteringHelpers);

  const handleDistributeParticipants = (participantsPerGroup: number) => {
    const eloSortedParticipants = sortParticipantsByElo(unassignedParticipants);
    const dwzSortedParticipants = sortParticipantsByDwz(unassignedParticipants);

    const updatedGroups: GridGroup[] = [];
    let unassignedIndex = 0;

    for (let i = 0; i < gridGroups.length; i++) {
      const currentGroup = gridGroups[i];
      const currentParticipantCount = currentGroup.participants.length;
      const spotsNeeded = Math.max(
        0,
        participantsPerGroup - currentParticipantCount,
      );

      const endIndex = Math.min(
        unassignedIndex + spotsNeeded,
        unassignedParticipants.length,
      );

      let participantsToAdd: ParticipantWithName[];

      if (i < NUMBER_OF_GROUPS_WITH_ELO) {
        participantsToAdd = eloSortedParticipants.slice(
          unassignedIndex,
          endIndex,
        );
      } else {
        participantsToAdd = dwzSortedParticipants.slice(
          unassignedIndex,
          endIndex,
        );
      }

      updatedGroups.push({
        ...currentGroup,
        participants: [...currentGroup.participants, ...participantsToAdd],
      });

      unassignedIndex = endIndex;
    }

    const remainingUnassigned = unassignedParticipants.slice(unassignedIndex);

    setGridGroups(updatedGroups);
    setUnassignedParticipants(remainingUnassigned);

    const assignedCount =
      unassignedParticipants.length - remainingUnassigned.length;
    toast.success(
      `${assignedCount} Teilnehmer auf ${gridGroups.length} Gruppen verteilt. ${remainingUnassigned.length} verbleiben.`,
    );
  };

  const handleAddNewGroup = async () => {
    const existingGroupNumbers = await getExistingGroupNumbers(tournamentId);
    const allExistingGroupNumbers = [
      ...existingGroupNumbers,
      ...gridGroups.map((g) => g.groupNumber),
    ];

    let nextGroupNumber = 1;
    while (allExistingGroupNumbers.includes(nextGroupNumber)) {
      nextGroupNumber++;
    }

    const newGroup: GridGroup = {
      id: Date.now(),
      isNew: true,
      groupNumber: nextGroupNumber,
      groupName: generateGroupName(nextGroupNumber),
      dayOfWeek: null,
      participants: [],
      matchEnteringHelpers: [],
    };

    setGridGroups((prev) => [...prev, newGroup]);
    handleSaveGroup(newGroup);
  };

  const handleDeleteGroup = (groupId: number) => {
    startTransition(async () => {
      const newGroups = [...gridGroups];
      const groupIndex = newGroups.findIndex((g) => g.id === groupId);
      if (groupIndex === -1) return;

      const deletedGroup = newGroups.splice(groupIndex, 1);
      setGridGroups(newGroups);
      setUnassignedParticipants([
        ...unassignedParticipants,
        ...deletedGroup[0].participants,
      ]);

      if (!deletedGroup[0].isNew) {
        await deleteGroup(groupId);
      }
    });
  };

  const handleUpdateGroupName = (groupId: number, newName: string) => {
    const updatedGroups = gridGroups.map((g) =>
      g.id === groupId ? { ...g, groupName: newName } : g,
    );
    setGridGroups(updatedGroups);

    const group = gridGroups.find((g) => g.id === groupId);
    if (group && !group.isNew) {
      startTransition(async () => {
        await updateGroupName(groupId, newName);
      });
    }
  };

  const handleSaveGroup = (groupData: GridGroup) => {
    startTransition(async () => {
      const groupId = await saveGroup(tournamentId, groupData);
      const matchEnteringHelperIds = getMatchEnteringHelpersForGroup(
        groupData.id,
      ).map((h) => h.id);
      await updateMatchEnteringHelpers(groupId, matchEnteringHelperIds);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end gap-4 items-center">
        <Button
          variant="outline"
          onClick={() => startTransition(handleAddNewGroup)}
          disabled={isPending}
        >
          Gruppe hinzufügen
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
          onSaveGroup={handleSaveGroup}
          onUpdateGroupName={handleUpdateGroupName}
          onAddHelperToGroup={addHelperToGroup}
          onRemoveHelperFromGroup={removeHelperFromGroup}
          onDistributeParticipants={handleDistributeParticipants}
        />
      </div>
    </div>
  );
}

function sortParticipantsByElo(
  participants: ParticipantWithName[],
): ParticipantWithName[] {
  return [...participants].sort((a, b) => {
    if (a.fideRating !== null && b.fideRating !== null) {
      if (a.fideRating !== b.fideRating) {
        return b.fideRating - a.fideRating;
      }
    } else if (a.fideRating !== null && b.fideRating === null) {
      return -1;
    } else if (a.fideRating === null && b.fideRating !== null) {
      return 1;
    }

    if (a.dwzRating !== null && b.dwzRating !== null) {
      if (a.dwzRating !== b.dwzRating) {
        return b.dwzRating - a.dwzRating;
      }
    } else if (a.dwzRating !== null && b.dwzRating === null) {
      return -1;
    } else if (a.dwzRating === null && b.dwzRating !== null) {
      return 1;
    }

    return a.profile.lastName.localeCompare(b.profile.lastName);
  });
}

function sortParticipantsByDwz(
  participants: ParticipantWithName[],
): ParticipantWithName[] {
  return [...participants].sort((a, b) => {
    if (a.dwzRating !== null && b.dwzRating !== null) {
      if (a.dwzRating !== b.dwzRating) {
        return b.dwzRating - a.dwzRating;
      }
    } else if (a.dwzRating !== null && b.dwzRating === null) {
      return -1;
    } else if (a.dwzRating === null && b.dwzRating !== null) {
      return 1;
    }

    return a.profile.lastName.localeCompare(b.profile.lastName);
  });
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
