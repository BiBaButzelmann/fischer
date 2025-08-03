"use client";

import { ParticipantWithName } from "@/db/types/participant";
import { GroupsGrid } from "./groups-grid";
import { useState, useTransition } from "react";
import { GridGroup } from "./types";
import { Button } from "@/components/ui/button";
import { updateGroups } from "@/actions/group";

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
    setGridGroups((prev) => [
      ...prev,
      {
        id: Date.now(),
        isNew: true,
        groupNumber: prev.length + 1,
        groupName: `Gruppe ${prev.length + 1}`,
        dayOfWeek: null,
        participants: [],
      } as GridGroup,
    ]);
  };

  const handleDeleteGroup = (groupId: number) => {
    const newGroups = [...gridGroups];
    const groupIndex = newGroups.findIndex((g) => g.id === groupId);
    if (groupIndex === -1) return;

    const deletedGroup = newGroups.splice(groupIndex, 1);
    setGridGroups(newGroups);
    setUnassignedParticipants([
      ...unassignedParticipants,
      ...deletedGroup[0].participants,
    ]);
  };

  const handleSave = () => {
    startTransition(async () => {
      await updateGroups(tournamentId, gridGroups);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-left gap-2">
        <Button variant="outline" onClick={handleSave} disabled={isPending}>
          Gruppenaufteilung speichern
        </Button>
        <Button variant="outline" onClick={handleAddNewGroup}>
          Gruppe hinzufügen
        </Button>
      </div>
      <GroupsGrid
        tournamentId={tournamentId}
        groups={gridGroups}
        unassignedParticipants={unassignedParticipants}
        onChangeGroups={setGridGroups}
        onChangeUnassignedParticipants={setUnassignedParticipants}
        onDeleteGroup={handleDeleteGroup}
      />
    </div>
  );
}
