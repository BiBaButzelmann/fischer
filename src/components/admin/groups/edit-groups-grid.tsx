"use client";

import { ParticipantWithName } from "@/db/types/participant";
import { GroupsGrid } from "./groups-grid";
import { useState, useTransition } from "react";
import { GridGroup } from "./types";
import { Button } from "@/components/ui/button";
import { updateGroups } from "@/actions/group";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

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
      setShowConfirmDialog(false);
    });
  };

  const confirmSave = () => {
    setShowConfirmDialog(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-left gap-2">
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              onClick={confirmSave}
              disabled={isPending}
            >
              Gruppenaufteilung speichern
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Gruppenaufteilung speichern
              </DialogTitle>
              <DialogDescription className="text-left space-y-3">
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>
                      Folgende Daten werden unwiderruflich gelöscht:
                    </strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Alle bestehenden Gruppen dieses Turniers</li>
                    <li>Alle Spiele und Paarungen der Gruppen</li>
                    <li>Alle Spieltermine und Kalendereinträge</li>
                    <li>Alle PGN-Notationen der Spiele</li>
                    <li>Alle Spielverlegungen</li>
                    <li>Alle Eingabehelfer-Zuordnungen</li>
                  </ul>
                  <p className="mt-3">
                    <strong>
                      Anschließend werden die Gruppen neu erstellt
                    </strong>{" "}
                    mit den aktuellen Einstellungen.
                  </p>
                  <p className="text-red-600 font-medium">
                    Diese Aktion kann nicht rückgängig gemacht werden!
                  </p>
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
                disabled={isPending}
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleSave}
                disabled={isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {isPending ? "Speichere..." : "Trotzdem speichern"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
