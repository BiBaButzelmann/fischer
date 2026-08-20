"use client";

import { useState } from "react";
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

type Props = {
  isPending: boolean;
  onDelete?: () => void;
};

export function RoleFormActions({ isPending, onDelete }: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className="flex items-center justify-end gap-2">
      {onDelete ? (
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogTrigger asChild>
            <Button
              disabled={isPending}
              type="button"
              className="w-full sm:w-auto"
              variant={"outline"}
            >
              Anmeldung löschen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Anmeldung löschen</DialogTitle>
              <DialogDescription>
                Möchtest du deine Anmeldung wirklich löschen? Deine Angaben
                werden entfernt. Du kannst dich während der Anmeldephase
                jederzeit erneut anmelden.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => setDeleteOpen(false)}
              >
                Abbrechen
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={isPending}
                onClick={onDelete}
              >
                {isPending ? "Wird gelöscht..." : "Anmeldung löschen"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
      <Button disabled={isPending} type="submit" className="w-full sm:w-auto">
        Änderungen speichern
      </Button>
    </div>
  );
}
