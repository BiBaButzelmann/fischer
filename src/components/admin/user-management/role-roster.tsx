import { ProfileWithName } from "@/db/types/profile";
import { compareByName } from "@/lib/participant";
import { ContactLinks } from "./person-row";
import { Roster } from "./roster";
import { RoleRow } from "./role-row";
import { TournamentRef } from "./types";

type RoleMember = {
  id: number;
  profile: ProfileWithName;
  meta?: string;
};

type Props = {
  members: RoleMember[];
  tournament: TournamentRef;
  emptyMessage: string;
  description?: string;
};

export function RoleRoster({
  members,
  tournament,
  emptyMessage,
  description,
}: Props) {
  const sortedMembers = [...members].sort((a, b) =>
    compareByName(a.profile, b.profile),
  );

  return (
    <Roster
      count={members.length}
      emptyMessage={emptyMessage}
      description={description}
    >
      {sortedMembers.map((member) => (
        <RoleRow
          key={member.id}
          profile={member.profile}
          tournament={tournament}
          meta={
            <>
              {member.meta ? <p>{member.meta}</p> : null}
              <ContactLinks
                email={member.profile.email}
                phoneNumber={member.profile.phoneNumber}
              />
            </>
          }
        />
      ))}
    </Roster>
  );
}
