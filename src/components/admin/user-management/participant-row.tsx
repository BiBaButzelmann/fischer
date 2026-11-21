"use client";

import { useState } from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { DsbLinkDialog } from "@/components/admin/dsb-link-dialog";
import { ParticipantWithProfileAndGroup } from "@/db/types/participant";
import { getFullNameWithTitle } from "@/lib/participant";
import { DEFAULT_CLUB_LABEL } from "@/constants/constants";
import { HSK_VKZ } from "@/lib/dsb/constants";
import { ContactLinks } from "./person-row";
import { RoleRow } from "./role-row";
import { TournamentRef } from "./types";

type Props = {
  participant: ParticipantWithProfileAndGroup;
  tournament: TournamentRef;
};

export function ParticipantRow({ participant, tournament }: Props) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const { profile } = participant;
  const isLinked = participant.dsbPersonId != null;

  return (
    <RoleRow
      profile={profile}
      tournament={tournament}
      displayName={getFullNameWithTitle(
        participant.title,
        profile.firstName,
        profile.lastName,
      )}
      meta={
        <ContactLinks email={profile.email} phoneNumber={profile.phoneNumber} />
      }
      menuItems={
        <DropdownMenuItem onSelect={() => setLinkDialogOpen(true)}>
          {isLinked
            ? "DSB-Verknüpfung ändern …"
            : "DSB-Verknüpfung herstellen …"}
        </DropdownMenuItem>
      }
    >
      <DsbLinkDialog
        participantId={participant.id}
        firstName={profile.firstName}
        lastName={profile.lastName}
        vkz={participant.chessClub === DEFAULT_CLUB_LABEL ? HSK_VKZ : null}
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
      />
    </RoleRow>
  );
}
