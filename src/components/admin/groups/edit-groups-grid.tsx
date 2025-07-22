"use client";

import { ParticipantWithName } from "@/db/types/participant";
import { GroupWithParticipants } from "@/db/types/group";
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
  groups: GroupWithParticipants[];
  unassignedParticipants: ParticipantWithName[];
}) {
  const [isPending, startTransition] = useTransition();

  const [unassignedParticipants, setUnassignedParticipants] = useState(
    initialUnassignedParticipants,
  );
  const [gridGroups, setGridGroups] = useState(() =>
    initialGroups.map(
      (group) =>
        ({
          id: group.id,
          isNew: false,
          groupNumber: group.groupNumber,
          groupName: group.groupName,
          matchDay: group.matchDay,
          participants: group.participants,
        }) as GridGroup,
    ),
  );

  const handleAddNewGroup = () => {
    setGridGroups((prev) => [
      ...prev,
      {
        id: Date.now(),
        isNew: true,
        groupNumber: prev.length + 1,
        groupName: `Gruppe ${prev.length + 1}`,
        matchDay: null,
        participants: [],
      } as GridGroup,
    ]);
  };

  const handleSave = () => {
    startTransition(async () => {
      await updateGroups(
        tournamentId,
        gridGroups,
        initialUnassignedParticipants,
      );
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
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
      />
      <Button onClick={handleSave} disabled={isPending}>
        Gruppenaufteilung Speichern
      </Button>
    </div>
  );
}
