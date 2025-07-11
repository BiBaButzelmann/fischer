import { ParticipantWithName } from "@/db/types/participant";
import { GroupsGrid } from "./groups-grid";
import { GroupWithParticipants } from "@/db/types/group";
import { GridGroup } from "./types";

// TODO: remove this component, put logic into EditGroups
export async function EditGroupsGrid({
  groups: initialGroups,
  unassignedParticipants: initialUnassignedParticipants,
}: {
  groups: GroupWithParticipants[];
  unassignedParticipants: ParticipantWithName[];
}) {
  const gridGroups: GridGroup[] = initialGroups.map((group) => ({
    // TODO: we probably don't need the id here
    id: group.id,
    groupNumber: group.groupNumber,
    groupName: group.groupName,
    matchDay: group.matchDay,
    participants: group.participants,
  }));

  return (
    <GroupsGrid
      groups={gridGroups}
      unassignedParticipants={initialUnassignedParticipants}
    />
  );
}
