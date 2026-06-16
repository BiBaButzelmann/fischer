import { authWithRedirect } from "@/auth/utils";
import { NameCard } from "@/components/admin/name-cards/name-cards";
import { getParticipantsInGroup } from "@/db/repositories/game";
import { getGroupsByTournamentId } from "@/db/repositories/group";
import { getLatestTournament } from "@/db/repositories/tournament";

import invariant from "tiny-invariant";

export default async function Page() {
  await authWithRedirect();
  const tournament = await getLatestTournament();
  invariant(tournament != null, "No active tournament found");

  const groups = await getGroupsByTournamentId(tournament.id);
  const participantsInGroups = await Promise.all(
    groups.map((group) => getParticipantsInGroup(group.id)),
  );

  return (
    <div className="w-[210mm] grid grid-cols-2 gap-[5mm] p-[3mm]">
      {participantsInGroups.map((participants, index) =>
        participants.map((participant) => (
          <NameCard
            key={participant.id}
            tournamentName={tournament.name}
            groupName={groups[index].groupName}
            participant={participant}
          />
        )),
      )}
    </div>
  );
}
