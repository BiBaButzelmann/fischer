import { EditGroupsGrid } from "../groups/edit-groups-grid";
import { Tournament } from "@/db/types/tournament";
import { getGroupsByTournamentId } from "@/db/repositories/group";
import { getUnassignedParticipantsByTournamentId } from "@/db/repositories/participant";

export async function EditGroups({ tournament }: { tournament: Tournament }) {
  const groups = await getGroupsByTournamentId(tournament.id);
  const unassignedParticipants = await getUnassignedParticipantsByTournamentId(
    tournament.id,
  );

  return (
    <EditGroupsGrid
      tournamentId={tournament.id}
      groups={groups}
      unassignedParticipants={unassignedParticipants}
    />
  );
}
