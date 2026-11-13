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
import { softDeleteUserProfile } from "@/actions/admin";
import { TournamentRef } from "./types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  displayName: string;
  tournament: TournamentRef;
};

export function DeactivateUserDialog({
  open,
  onOpenChange,
  userId,
  displayName,
  tournament,
}: Props) {
  const [isPending, startTransition] = useTransition();

  const handleDeactivate = () => {
    startTransition(async () => {
      const result = await softDeleteUserProfile(userId, tournament.id);
      if (!result.success) {
        toast.error(
          "reason" in result ? result.reason : "Deaktivieren fehlgeschlagen.",
        );
        return;
      }
      toast.success(`${displayName} ist für ${tournament.name} deaktiviert.`);
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{displayName} deaktivieren?</DialogTitle>
          <DialogDescription>
            {displayName} verliert alle Rollen in {tournament.name}. Offene
            Partien werden kampflos gewertet. Diese Wertungen bleiben auch nach
            dem Wiederherstellen bestehen. Andere Turniere sind nicht betroffen.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleDeactivate} disabled={isPending}>
            {isPending ? "Wird deaktiviert …" : "Deaktivieren"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
