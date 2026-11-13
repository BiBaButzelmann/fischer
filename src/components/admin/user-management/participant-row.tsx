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
import { Ratings } from "./ratings";
import { TournamentRef } from "./types";

type Props = {
  participant: ParticipantWithProfile;
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
        <>
          <p className="flex flex-wrap items-baseline gap-x-3">
            <span>{participant.chessClub}</span>
            {isLinked ? (
              <span className="font-mono text-xs">
                DSB {participant.dsbPersonId}
              </span>
            ) : (
              <span>Keine DSB-Verknüpfung</span>
            )}
            {participant.fideId ? (
              <a
                href={`https://ratings.fide.com/profile/${participant.fideId}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-xs underline-offset-4 hover:text-foreground hover:underline"
              >
                FIDE {participant.fideId}
              </a>
            ) : null}
          </p>
          <ContactLinks phoneNumber={profile.phoneNumber} />
        </>
      }
      aside={
        <Ratings
          fideRating={participant.fideRating}
          dwzRating={participant.dwzRating}
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
