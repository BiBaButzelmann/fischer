"use client";

import { useState } from "react";
import { RatingUpdatePanel } from "@/components/admin/rating-update-panel";
import { ParticipantWithProfileAndGroup } from "@/db/types/participant";
import { groupParticipantsByStrength, matchesSearch } from "@/lib/roster";
import { GroupHeader } from "./group-header";
import { ParticipantRow } from "./participant-row";
import { Roster, RosterEmpty, RosterList } from "./roster";
import { RosterSearch } from "./roster-search";
import { TournamentRef } from "./types";

type Props = {
  participants: ParticipantWithProfileAndGroup[];
  tournament: TournamentRef;
};

export function ParticipantRoster({ participants, tournament }: Props) {
  const [query, setQuery] = useState("");
  const sections = groupParticipantsByStrength(participants);
  const hasGroups = sections.some((section) => section.group != null);
  const visibleSections = sections
    .map((section) => ({
      group: section.group,
      members: section.participants,
      matches: section.participants.filter((participant) =>
        matchesSearch(participant.profile, query),
      ),
    }))
    .filter((section) => section.matches.length > 0);

  return (
    <Roster
      count={participants.length}
      emptyMessage="Für dieses Turnier hat sich noch niemand angemeldet."
      search={
        <RosterSearch
          value={query}
          onChange={setQuery}
          placeholder="Name, E-Mail oder Telefon"
        />
      }
      toolbar={<RatingUpdatePanel participants={participants} />}
    >
      {visibleSections.length === 0 ? (
        <RosterEmpty>Keine Treffer für „{query.trim()}“.</RosterEmpty>
      ) : (
        <div className="space-y-4">
          {visibleSections.map((section) => (
            <RosterList
              key={section.group?.id ?? "none"}
              header={
                hasGroups ? (
                  <GroupHeader
                    group={section.group}
                    memberCount={section.members.length}
                    memberEmails={section.members.map(
                      (participant) => participant.profile.email,
                    )}
                    tournamentName={tournament.name}
                  />
                ) : null
              }
            >
              {section.matches.map((participant) => (
                <ParticipantRow
                  key={participant.id}
                  participant={participant}
                  tournament={tournament}
                />
              ))}
            </RosterList>
          ))}
        </div>
      )}
    </Roster>
  );
}
