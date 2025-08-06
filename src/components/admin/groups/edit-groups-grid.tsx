"use client";

import { ParticipantWithName } from "@/db/types/participant";
import { GroupsGrid } from "./groups-grid";
import { useState, useTransition } from "react";
import { GridGroup } from "./types";
import { Button } from "@/components/ui/button";
import { saveGroup, deleteGroup, updateGroupName } from "@/actions/group";

export function EditGroupsGrid({
  tournamentId,
  groups: initialGroups,
  unassignedParticipants: initialUnassignedParticipants,
}: {
  tournamentId: number;
  groups: GridGroup[];
  unassignedParticipants: ParticipantWithName[];
}) {
  const [isPending, startTransition] = useTransition();

  const [unassignedParticipants, setUnassignedParticipants] = useState(
    initialUnassignedParticipants,
  );
  const [gridGroups, setGridGroups] = useState(initialGroups);

  const handleAddNewGroup = () => {
    setGridGroups((prev) => {
      const existingNumbers = prev.map((g) => g.groupNumber);
      let nextGroupNumber = 1;
      while (existingNumbers.includes(nextGroupNumber)) {
        nextGroupNumber++;
      }

      return [
        ...prev,
        {
          id: Date.now(),
          isNew: true,
          groupNumber: nextGroupNumber,
          groupName: `Gruppe ${nextGroupNumber}`,
          dayOfWeek: null,
          participants: [],
        } as GridGroup,
      ];
    });
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
      await saveGroup(tournamentId, groupData);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={handleAddNewGroup}
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
        />
      </div>
    </div>
  );
}
