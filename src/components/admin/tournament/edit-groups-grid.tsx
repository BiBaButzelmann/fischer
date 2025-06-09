import { ParticipantWithName } from "@/db/types/participant";
import { GroupsGrid } from "./groups-grid";
import { GroupWithParticipants } from "@/db/types/group";
import { db } from "@/db/client";
import { GridGroup } from "./types";

export async function EditGroupsGrid({
  groups: initialGroups,
}: {
  groups: GroupWithParticipants[];
}) {
  const gridGroups: GridGroup[] = initialGroups.map((group) => ({
    // TODO: we probably don't need the id here
    id: group.id,
    groupNumber: group.groupNumber,
    groupName: group.groupName,
    participants: group.participants,
    isNew: false,
  }));

  return <GroupsGrid groups={gridGroups} />;
}
