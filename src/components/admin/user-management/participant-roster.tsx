import { RatingUpdatePanel } from "@/components/admin/rating-update-panel";
import { ParticipantWithProfileAndGroup } from "@/db/types/participant";
import { groupParticipantsByStrength } from "@/lib/roster";
import { GroupHeader } from "./group-header";
import { ParticipantRow } from "./participant-row";
import { Roster, RosterList } from "./roster";
import { TournamentRef } from "./types";

type Props = {
  participants: ParticipantWithProfileAndGroup[];
  tournament: TournamentRef;
  rolesByProfileId: Record<number, string[]>;
};

export function ParticipantRoster({
  participants,
  tournament,
  rolesByProfileId,
}: Props) {
  const sections = groupParticipantsByStrength(participants);
  const hasGroups = sections.some((section) => section.group != null);

  return (
    <Roster
      count={participants.length}
      emptyMessage="Für dieses Turnier hat sich noch niemand angemeldet."
      toolbar={<RatingUpdatePanel participants={participants} />}
    >
      <div className="space-y-4">
        {sections.map((section) => (
          <RosterList
            key={section.group?.id ?? "none"}
            header={
              hasGroups ? (
                <GroupHeader
                  group={section.group}
                  memberCount={section.participants.length}
                  memberEmails={section.participants.map(
                    (participant) => participant.profile.email,
                  )}
                  tournamentName={tournament.name}
                />
              ) : null
            }
          >
            {section.participants.map((participant) => (
              <ParticipantRow
                key={participant.id}
                participant={participant}
                tournament={tournament}
                roles={rolesByProfileId[participant.profile.id] ?? []}
              />
            ))}
          </RosterList>
        ))}
      </div>
    </Roster>
  );
}
