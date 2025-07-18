import { ParticipantWithName } from "@/db/types/participant";
import { GroupWithParticipants } from "@/db/types/group";
import { GridGroup } from "./types";
import { GroupsGrid } from "./groups-grid";

export async function EditGroupsGrid({
  tournamentId,
  groups: initialGroups,
  unassignedParticipants: initialUnassignedParticipants,
}: {
  tournamentId: number;
  groups: GroupWithParticipants[];
  unassignedParticipants: ParticipantWithName[];
}) {
  const gridGroups: GridGroup[] = initialGroups.map((group) => ({
    id: group.id,
    groupNumber: group.groupNumber,
    groupName: group.groupName,
    matchDay: group.matchDay,
    participants: group.participants,
  }));

  return (
    <GroupsGrid
      tournamentId={tournamentId}
      groups={gridGroups}
      unassignedParticipants={initialUnassignedParticipants}
    />
  );
}
