type RoleMembers = {
  label: string;
  members: { profile: { id: number } }[];
};

export function collectRolesByProfileId(roleMembers: RoleMembers[]) {
  const rolesByProfileId: Record<number, string[]> = {};
  for (const { label, members } of roleMembers) {
    for (const { profile } of members) {
      rolesByProfileId[profile.id] = [
        ...(rolesByProfileId[profile.id] ?? []),
        label,
      ];
    }
  }
  return rolesByProfileId;
}
