import { PairingContainer } from "@/components/admin/pairings/pairing-container";
import {
  getGroupsByTournamentId,
  getGroupsWithGamesByTournamentId,
} from "@/db/repositories/group";
import { getLatestTournament } from "@/db/repositories/tournament";

export default async function Page() {
  const tournament = await getLatestTournament();

  if (!tournament) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Paarungen</h1>
        <p className="text-gray-600">Kein aktives Turnier gefunden.</p>
      </div>
    );
  }
  const [groups, groupsWithGames] = await Promise.all([
    getGroupsByTournamentId(tournament.id),
    getGroupsWithGamesByTournamentId(tournament.id),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Paarungen</h1>
      </div>
      <PairingContainer
        tournamentId={tournament.id}
        groups={groups}
        groupsWithGames={groupsWithGames}
      />
    </div>
  );
}
