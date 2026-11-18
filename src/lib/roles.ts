import { TournamentRole, tournamentRoles } from "@/db/types/role";

type RoleMembers = Record<TournamentRole, { profile: { id: number } }[]>;

type RolesByProfileId<Members extends RoleMembers> = Record<
  number,
  { [Role in TournamentRole]?: Members[Role][number] }
>;

export function groupRolesByProfileId<Members extends RoleMembers>(
  members: Members,
) {
  const rolesByProfileId: RolesByProfileId<Members> = {};

  function addMembers<Role extends TournamentRole>(role: Role) {
    for (const member of members[role]) {
      const roles = (rolesByProfileId[member.profile.id] ??= {});
      roles[role] = member;
    }
  }
  tournamentRoles.forEach((role) => addMembers(role));

  return rolesByProfileId;
}
