"use client";

import { useState } from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { DsbLinkDialog } from "@/components/admin/dsb-link-dialog";
import { ParticipantWithProfile } from "@/db/types/participant";
import { getFullNameWithTitle } from "@/lib/participant";
import { DEFAULT_CLUB_LABEL } from "@/constants/constants";
import { HSK_VKZ } from "@/lib/dsb/constants";
import { ContactLinks } from "./person-row";
import { RoleRow } from "./role-row";
import { RatingsSection } from "./ratings";
import { TournamentRef } from "./types";

type Props = {
  participant: ParticipantWithProfile;
  tournament: TournamentRef;
  roles: string[];
};

export function ParticipantRow({ participant, tournament, roles }: Props) {
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
      roles={roles}
      meta={
        <ContactLinks email={profile.email} phoneNumber={profile.phoneNumber} />
      }
      detailsSubtitle={
        <>
          <span>{participant.chessClub}</span>
          {participant.nationality ? (
            <span>{participant.nationality}</span>
          ) : null}
          {participant.birthYear ? (
            <span className="whitespace-nowrap">
              Jg. {participant.birthYear}
            </span>
          ) : null}
        </>
      }
      details={
        <RatingsSection
          fideRating={participant.fideRating}
          dwzRating={participant.dwzRating}
          fideId={participant.fideId}
          dsbPersonId={participant.dsbPersonId}
        />
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
