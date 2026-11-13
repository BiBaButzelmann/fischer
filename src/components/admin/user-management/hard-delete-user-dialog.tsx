"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { hardDeleteUserProfile } from "@/actions/admin";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  displayName: string;
};

export function HardDeleteUserDialog({
  open,
  onOpenChange,
  userId,
  displayName,
}: Props) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await hardDeleteUserProfile(userId);
      if (!result.success) {
        toast.error(
          "reason" in result ? result.reason : "Löschen fehlgeschlagen.",
        );
        return;
      }
      toast.success(`${displayName} ist gelöscht.`);
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{displayName} endgültig löschen?</DialogTitle>
          <DialogDescription>
            Konto, Profil und alle Rollen werden gelöscht. Das lässt sich nicht
            rückgängig machen. Löschen geht nur, wenn das Profil an keinen
            Partien beteiligt ist, keine Verlegungen angefragt und kein Turnier
            organisiert hat.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "Wird gelöscht …" : "Endgültig löschen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
