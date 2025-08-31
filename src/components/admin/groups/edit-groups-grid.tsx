"use client";

import { ParticipantWithName } from "@/db/types/participant";
import { GroupsGrid } from "./groups-grid";
import { useState, useTransition } from "react";
import { GridGroup } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import invariant from "tiny-invariant";

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
  const [participantsPerGroup, setParticipantsPerGroup] = useState<string>("");

  const [unassignedParticipants, setUnassignedParticipants] = useState(
    initialUnassignedParticipants,
  );
  const [gridGroups, setGridGroups] = useState(initialGroups);

  const {
    assignments: helperAssignments,
    helperAssignedCounts,
    addHelperToGroup,
    removeHelperFromGroup,
    getMatchEnteringHelpersForGroup,
  } = useHelperAssignments(currentAssignments, matchEnteringHelpers);

  const sortParticipantsByElo = (
    participants: ParticipantWithName[],
  ): ParticipantWithName[] => {
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
  };

  const sortParticipantsByDwz = (
    participants: ParticipantWithName[],
  ): ParticipantWithName[] => {
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
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAutoDistribute();
    }
  };

  const handleAutoDistribute = () => {
    const playersPerGroup = parseInt(participantsPerGroup);

    try {
      invariant(
        !isNaN(playersPerGroup) && playersPerGroup > 0,
        "Bitte gib eine gültige Anzahl von Spielern pro Gruppe ein.",
      );

      invariant(
        unassignedParticipants.length > 0,
        "Keine unzugewiesenen Teilnehmer vorhanden.",
      );

      invariant(
        gridGroups.length > 0,
        "Keine Gruppen vorhanden. Bitte erstelle zuerst Gruppen.",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ungültige Eingabe");
      return;
    }

    const eloSortedParticipants = sortParticipantsByElo(unassignedParticipants);
    const dwzSortedParticipants = sortParticipantsByDwz(unassignedParticipants);

    const updatedGroups: GridGroup[] = [];
    let unassignedIndex = 0;

    for (let i = 0; i < gridGroups.length; i++) {
      const currentGroup = gridGroups[i];
      const currentParticipantCount = currentGroup.participants.length;
      const spotsNeeded = Math.max(
        0,
        playersPerGroup - currentParticipantCount,
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

  const generateGroupName = (groupNumber: number): string => {
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
  };

  const handleAddNewGroup = async () => {
    try {
      const existingGroupNumbers = await getExistingGroupNumbers(tournamentId);
      invariant(
        Array.isArray(existingGroupNumbers),
        "Fehler beim Laden der bestehenden Gruppennummern",
      );

      setGridGroups((prev) => {
        const allExistingNumbers = [
          ...existingGroupNumbers,
          ...prev.map((g) => g.groupNumber),
        ];

        let nextGroupNumber = 1;
        while (allExistingNumbers.includes(nextGroupNumber)) {
          nextGroupNumber++;
        }

        const groupName = generateGroupName(nextGroupNumber);

        return [
          ...prev,
          {
            id: Date.now(),
            isNew: true,
            groupNumber: nextGroupNumber,
            groupName: groupName,
            dayOfWeek: null,
            participants: [],
            matchEnteringHelpers: [],
          } as GridGroup,
        ];
      });

      toast.success("Neue Gruppe hinzugefügt");
    } catch (error) {
      console.error("Error creating new group:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Fehler beim Erstellen einer neuen Gruppe",
      );
    }
  };
  const handleDeleteGroup = (groupId: number) => {
    startTransition(async () => {
      try {
        const newGroups = [...gridGroups];
        const groupIndex = newGroups.findIndex((g) => g.id === groupId);

        invariant(groupIndex !== -1, "Gruppe nicht gefunden");

        const deletedGroup = newGroups.splice(groupIndex, 1);
        setGridGroups(newGroups);
        setUnassignedParticipants([
          ...unassignedParticipants,
          ...deletedGroup[0].participants,
        ]);

        if (!deletedGroup[0].isNew) {
          await deleteGroup(groupId);
        }
      } catch {
        toast.error("Fehler beim Löschen der Gruppe");
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
      try {
        const groupId = await saveGroup(tournamentId, groupData);
        invariant(
          groupId,
          "Gruppe ID sollte nach dem Speichern definiert sein",
        );

        const matchEnteringHelperIds = getMatchEnteringHelpersForGroup(
          groupData.id,
        ).map((h) => h.id);
        await updateMatchEnteringHelpers(groupId, matchEnteringHelperIds);
        toast.success("Gruppe erfolgreich gespeichert");
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Fehler beim Speichern der Gruppe",
        );
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end gap-4 items-center">
        <Input
          type="number"
          placeholder="Gruppengröße"
          value={participantsPerGroup}
          onChange={(e) => setParticipantsPerGroup(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-40"
          min="1"
        />
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
          onChangeGroups={setGridGroups}
          onChangeUnassignedParticipants={setUnassignedParticipants}
          onDeleteGroup={handleDeleteGroup}
          onSaveGroup={handleSaveGroup}
          onUpdateGroupName={handleUpdateGroupName}
          matchEnteringHelpers={matchEnteringHelpers}
          helperAssignedCounts={helperAssignedCounts}
          helperAssignments={helperAssignments}
          onAddHelperToGroup={addHelperToGroup}
          onRemoveHelperFromGroup={removeHelperFromGroup}
        />
      </div>
    </div>
  );
}
