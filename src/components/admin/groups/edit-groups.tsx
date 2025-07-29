import { EditGroupsGrid } from "../groups/edit-groups-grid";
import { Tournament } from "@/db/types/tournament";
import { type GridGroup } from "./types";
import { getGroupsWithParticipantsByTournamentId } from "@/db/repositories/group";
import { getUnassignedParticipantsByTournamentId } from "@/db/repositories/participant";

export async function EditGroups({ tournament }: { tournament: Tournament }) {
  const groupsData = await getGroupsWithParticipantsByTournamentId(
    tournament.id,
  );

  const unassignedParticipants = await getUnassignedParticipantsByTournamentId(
    tournament.id,
  );

  const groups = groupsData.map(
    (g) =>
      ({
        id: g.id,
        isNew: false,
        groupName: g.groupName,
        groupNumber: g.groupNumber,
        dayOfWeek: g.dayOfWeek,
        participants: g.participants.map(({ groupPosition, participant }) => ({
          groupPosition: groupPosition,
          ...participant,
        })),
      }) as GridGroup,
  );

  return (
    <EditGroupsGrid
      tournamentId={tournament.id}
      groups={groups}
      unassignedParticipants={unassignedParticipants}
    />
  );
}
