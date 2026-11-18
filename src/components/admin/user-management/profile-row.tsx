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
import { PersonDetails } from "./person-details";
import { HistoryMenuItem, RowActions } from "./row-actions";
import { HardDeleteUserDialog } from "./hard-delete-user-dialog";
import { useTournamentRoles } from "./tournament-roles-context";
import { TournamentRef } from "./types";

type Props = {
  profile: ProfileWithName;
  tournament: TournamentRef;
};

export function ProfileRow({ profile, tournament }: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { trainer } = useTournamentRoles(profile.id);
  const displayName = getFullName(profile.firstName, profile.lastName);

  const handleTrainerToggle = () => {
    startTransition(async () => {
      const result = trainer
        ? await deleteTrainer(tournament.id, trainer.id)
        : await createTrainer(tournament.id, profile.id);
      if (isError(result)) {
        toast.error(result.error);
        return;
      }
      toast.success(
        trainer
          ? `${displayName} ist kein Trainer mehr.`
          : `${displayName} ist Trainer.`,
      );
    });
  };

  return (
    <PersonRow
      name={<PersonDetails name={displayName} profile={profile} />}
      tags={trainer ? <RowTag>Trainer</RowTag> : null}
      meta={
        <ContactLinks email={profile.email} phoneNumber={profile.phoneNumber} />
      }
      actions={
        <RowActions displayName={displayName} profileId={profile.id}>
          <DropdownMenuItem onSelect={handleTrainerToggle} disabled={isPending}>
            {trainer ? "Trainer-Rolle entfernen" : "Als Trainer eintragen"}
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
