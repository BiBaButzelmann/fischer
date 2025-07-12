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
import { User, Trash2, AlertTriangle, RotateCcw } from "lucide-react";
import { useState, useTransition } from "react";
import {
  softDeleteUserProfile,
  hardDeleteUserProfile,
  restoreUserProfile,
} from "@/actions/admin";
import { toast } from "sonner";

interface ProfileWithName {
  id: number;
  userId: string;
  firstName: string;
  lastName: string;
  deletedAt: Date | null;
}

type Props = {
  user: ProfileWithName;
  showDeleteActions?: boolean;
};

export function UserRow({ user, showDeleteActions = false }: Props) {
  const [softDeleteOpen, setSoftDeleteOpen] = useState(false);
  const [hardDeleteOpen, setHardDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const getDisplayName = (user: ProfileWithName) => {
    return `${user.firstName} ${user.lastName}`;
  };

  const handleSoftDelete = () => {
    startTransition(async () => {
      try {
        const result = await softDeleteUserProfile(user.userId);
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
        const result = await hardDeleteUserProfile(user.userId);
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
        const result = await restoreUserProfile(user.userId);
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
      className={`flex items-center justify-between px-3 py-2 rounded-md border ${
        user.deletedAt != null
          ? "bg-red-50 border-red-200"
          : "bg-gray-50 border-gray-200"
      }`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center ${
            user.deletedAt != null ? "bg-red-200" : "bg-gray-200"
          }`}
        >
          <User
            className={`h-3 w-3 ${
              user.deletedAt != null ? "text-red-600" : "text-gray-600"
            }`}
          />
        </div>
        <div className="flex flex-col">
          <span
            className={`font-medium text-sm ${
              user.deletedAt != null ? "text-red-900" : "text-gray-900"
            }`}
          >
            {getDisplayName(user)}
          </span>
          {user.deletedAt && (
            <span className="text-xs text-red-600">
              Deaktiviert:{" "}
              {new Date(user.deletedAt).toLocaleDateString("de-DE")}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-xs text-gray-500">ID: {user.id}</div>
        {/* Show restore button for disabled users, delete buttons for active users */}
        {user.deletedAt != null ? (
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
            {/* Soft Delete Button */}
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
                    Möchten Sie den Benutzer &quot;{getDisplayName(user)}&quot;
                    deaktivieren? Der Benutzer wird ausgeblendet, aber alle
                    Daten bleiben erhalten und können später wiederhergestellt
                    werden.
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

            {/* Hard Delete Button */}
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
                    Der Benutzer &quot;{getDisplayName(user)}&quot; und alle
                    zugehörigen Daten werden permanent aus der Datenbank
                    gelöscht.
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
