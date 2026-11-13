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
  displayName?: string;
  meta?: ReactNode;
  aside?: ReactNode;
  menuItems?: ReactNode;
  children?: ReactNode;
};

export function RoleRow({
  profile,
  tournament,
  displayName = getFullName(profile.firstName, profile.lastName),
  meta,
  aside,
  menuItems,
  children,
}: Props) {
  const [deactivateOpen, setDeactivateOpen] = useState(false);

  return (
    <PersonRow
      name={displayName}
      meta={meta}
      aside={aside}
      actions={
        <RowActions displayName={displayName} profileId={profile.id}>
          {menuItems}
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
      {children}
    </PersonRow>
  );
}
