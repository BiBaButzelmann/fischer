"use client";

import { useState } from "react";
import { ProfileWithName } from "@/db/types/profile";
import { matchesSearch } from "@/lib/roster";
import { ProfileRow } from "./profile-row";
import { Roster, RosterEmpty, RosterList } from "./roster";
import { RosterSearch } from "./roster-search";
import { TournamentRef } from "./types";

type Props = {
  profiles: ProfileWithName[];
  tournament: TournamentRef;
};

export function ProfileRoster({ profiles, tournament }: Props) {
  const [query, setQuery] = useState("");
  const matches = profiles.filter((profile) => matchesSearch(profile, query));

  return (
    <Roster
      count={profiles.length}
      emptyMessage="Es gibt noch keine registrierten Profile."
      description="Alle registrierten Konten, unabhängig vom Turnier. Endgültig löschen lässt sich ein Profil nur ohne Partien, Verlegungen und organisierte Turniere."
      search={
        <RosterSearch
          value={query}
          onChange={setQuery}
          placeholder="Name, E-Mail oder Telefon"
        />
      }
    >
      {matches.length === 0 ? (
        <RosterEmpty>Keine Treffer für „{query.trim()}“.</RosterEmpty>
      ) : (
        <RosterList>
          {matches.map((profile) => (
            <ProfileRow
              key={profile.id}
              profile={profile}
              tournament={tournament}
            />
          ))}
        </RosterList>
      )}
    </Roster>
  );
}
