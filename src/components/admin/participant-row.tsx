"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { User, Trash2, AlertTriangle, RotateCcw, Phone } from "lucide-react";
import { useState, useTransition } from "react";
import {
  softDeleteUserProfile,
  hardDeleteUserProfile,
  restoreUserProfile,
} from "@/actions/admin";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { matchDaysShort } from "@/constants/constants";
import { ProfileWithName } from "@/db/types/profile";
import { DayOfWeek } from "@/db/types/group";

type ParticipantRowProps = {
  participant: {
    id: number;
    dwzRating: number | null;
    fideRating: number | null;
    profile: ProfileWithName;
  };
  showDeleteActions?: boolean;
};

export function ParticipantRow({
  participant,
  showDeleteActions = false,
}: ParticipantRowProps) {
  const [softDeleteOpen, setSoftDeleteOpen] = useState(false);
  const [hardDeleteOpen, setHardDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const getDisplayName = (profile: ProfileWithName) => {
    return `${profile.firstName} ${profile.lastName}`;
  };

  const handleSoftDelete = () => {
    startTransition(async () => {
      try {
        const result = await softDeleteUserProfile(participant.profile.userId);
        if (result.success) {
          toast.success("Benutzer wurde erfolgreich deaktiviert.");
          setSoftDeleteOpen(false);
        } else {
          toast.error(
            "reason" in result
              ? result.reason
              : "Fehler beim Deaktivieren des Benutzers.",
          );
        }
      } catch {
        toast.error("Ein unerwarteter Fehler ist aufgetreten.");
      }
    });
  };

  const handleHardDelete = () => {
    startTransition(async () => {
      try {
        const result = await hardDeleteUserProfile(participant.profile.userId);
        if (result.success) {
          toast.success("Benutzer wurde erfolgreich gelöscht.");
          setHardDeleteOpen(false);
        } else {
          toast.error(
            "reason" in result
              ? result.reason
              : "Fehler beim Löschen des Benutzers.",
          );
        }
      } catch {
        toast.error("Ein unerwarteter Fehler ist aufgetreten.");
      }
    });
  };

  const handleRestore = () => {
    startTransition(async () => {
      try {
        const result = await restoreUserProfile(participant.profile.userId);
        if (result.success) {
          toast.success("Benutzer wurde erfolgreich wiederhergestellt.");
        } else {
          toast.error(
            "reason" in result
              ? result.reason
              : "Fehler beim Wiederherstellen des Benutzers.",
          );
        }
      } catch {
        toast.error("Ein unerwarteter Fehler ist aufgetreten.");
      }
    });
  };

  return (
    <div
      className={`flex items-center justify-between px-3 py-3 rounded-md border ${
        participant.profile.deletedAt != null
          ? "bg-red-50 border-red-200"
          : "bg-gray-50 border-gray-200"
      }`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center ${
            participant.profile.deletedAt != null ? "bg-red-200" : "bg-gray-200"
          }`}
        >
          <User
            className={`h-3 w-3 ${
              participant.profile.deletedAt != null
                ? "text-red-600"
                : "text-gray-600"
            }`}
          />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`font-medium text-sm ${
                participant.profile.deletedAt != null
                  ? "text-red-900"
                  : "text-gray-900"
              }`}
            >
              {getDisplayName(participant.profile)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="whitespace-nowrap w-[75px]">
              FIDE {participant.fideRating ?? "0"}
            </Badge>
            <Badge variant="secondary" className="whitespace-nowrap w-[75px]">
              DWZ {participant.dwzRating ?? "0"}
            </Badge>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-600">
            {participant.profile.phoneNumber && (
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <span>{participant.profile.phoneNumber}</span>
              </div>
            )}
          </div>
          {participant.profile.deletedAt && (
            <span className="text-xs text-red-600">
              Deaktiviert:{" "}
              {new Date(participant.profile.deletedAt).toLocaleDateString(
                "de-DE",
              )}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-xs text-gray-500">
          ID: {participant.profile.id}
        </div>
        {participant.profile.deletedAt != null ? (
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-green-600 border-green-300 hover:bg-green-50 hover:border-green-400"
            disabled={isPending}
            onClick={handleRestore}
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Wiederherstellen
          </Button>
        ) : showDeleteActions ? (
          <div className="flex items-center gap-1">
            <Dialog open={softDeleteOpen} onOpenChange={setSoftDeleteOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-orange-600 border-orange-300 hover:bg-orange-50 hover:border-orange-400"
                  disabled={isPending}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Trash2 className="h-5 w-5 text-orange-600" />
                    Benutzer deaktivieren
                  </DialogTitle>
                  <DialogDescription>
                    Möchten Sie den Benutzer &quot;
                    {getDisplayName(participant.profile)}&quot; deaktivieren?
                    Der Benutzer wird ausgeblendet, aber alle Daten bleiben
                    erhalten und können später wiederhergestellt werden.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setSoftDeleteOpen(false)}
                  >
                    Abbrechen
                  </Button>
                  <Button
                    onClick={handleSoftDelete}
                    disabled={isPending}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    {isPending ? "Wird deaktiviert..." : "Deaktivieren"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={hardDeleteOpen} onOpenChange={setHardDeleteOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                  disabled={isPending}
                >
                  <AlertTriangle className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    ACHTUNG: Benutzer permanent löschen
                  </DialogTitle>
                  <DialogDescription className="text-red-700">
                    <strong>
                      Diese Aktion kann nicht rückgängig gemacht werden!
                    </strong>
                    <br />
                    Der Benutzer &quot;{getDisplayName(participant.profile)}
                    &quot; und alle zugehörigen Daten werden permanent aus der
                    Datenbank gelöscht.
                    <br />
                    <br />
                    Diese Aktion ist nur möglich, wenn der Benutzer keine Spiele
                    gespielt oder Turniere organisiert hat.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setHardDeleteOpen(false)}
                  >
                    Abbrechen
                  </Button>
                  <Button
                    onClick={handleHardDelete}
                    disabled={isPending}
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isPending ? "Wird gelöscht..." : "PERMANENT LÖSCHEN"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        ) : null}
      </div>
    </div>
  );
}
