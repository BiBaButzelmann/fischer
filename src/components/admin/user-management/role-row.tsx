"use client";

import { ReactNode, useState } from "react";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ProfileWithName } from "@/db/types/profile";
import { getFullName } from "@/lib/participant";
import { PersonRow } from "./person-row";
import { HistoryMenuItem, RowActions } from "./row-actions";
import { DeactivateUserDialog } from "./deactivate-user-dialog";
import { TournamentRef } from "./types";

type Props = {
  profile: ProfileWithName;
  tournament: TournamentRef;
  meta?: ReactNode;
};

export function RoleRow({ profile, tournament, meta }: Props) {
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const displayName = getFullName(profile.firstName, profile.lastName);

  return (
    <PersonRow
      name={displayName}
      meta={meta}
      actions={
        <RowActions displayName={displayName} profileId={profile.id}>
          <HistoryMenuItem profileId={profile.id} />
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setDeactivateOpen(true)}>
            Im Turnier deaktivieren …
          </DropdownMenuItem>
        </RowActions>
      }
    >
      <DeactivateUserDialog
        open={deactivateOpen}
        onOpenChange={setDeactivateOpen}
        userId={profile.userId}
        displayName={displayName}
        tournament={tournament}
      />
    </PersonRow>
  );
}
