"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { createTrainer, deleteTrainer } from "@/actions/trainer";
import { ProfileWithName } from "@/db/types/profile";
import { isError } from "@/lib/actions";
import { getFullName } from "@/lib/participant";
import { ContactLinks, PersonRow, RowTag } from "./person-row";
import { HistoryMenuItem, RowActions } from "./row-actions";
import { HardDeleteUserDialog } from "./hard-delete-user-dialog";
import { TournamentRef } from "./types";

type Props = {
  profile: ProfileWithName;
  tournament: TournamentRef;
  trainerId?: number;
};

export function ProfileRow({ profile, tournament, trainerId }: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const displayName = getFullName(profile.firstName, profile.lastName);
  const isTrainer = trainerId != null;

  const handleTrainerToggle = () => {
    startTransition(async () => {
      const result = isTrainer
        ? await deleteTrainer(tournament.id, trainerId)
        : await createTrainer(tournament.id, profile.id);
      if (isError(result)) {
        toast.error(result.error);
        return;
      }
      toast.success(
        isTrainer
          ? `${displayName} ist kein Trainer mehr.`
          : `${displayName} ist Trainer.`,
      );
    });
  };

  return (
    <PersonRow
      name={displayName}
      tags={isTrainer ? <RowTag>Trainer</RowTag> : null}
      meta={
        <ContactLinks email={profile.email} phoneNumber={profile.phoneNumber} />
      }
      actions={
        <RowActions displayName={displayName} profileId={profile.id}>
          <DropdownMenuItem onSelect={handleTrainerToggle} disabled={isPending}>
            {isTrainer ? "Trainer-Rolle entfernen" : "Als Trainer eintragen"}
          </DropdownMenuItem>
          <HistoryMenuItem profileId={profile.id} />
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => setDeleteOpen(true)}
            className="text-destructive focus:text-accent-foreground"
          >
            Endgültig löschen …
          </DropdownMenuItem>
        </RowActions>
      }
    >
      <HardDeleteUserDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        userId={profile.userId}
        displayName={displayName}
      />
    </PersonRow>
  );
}
