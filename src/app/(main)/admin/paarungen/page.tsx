import { authWithRedirect } from "@/auth/utils";
import { PairingContainer } from "@/components/admin/pairings/pairing-container";
import { getGroupsWithParticipantsAndGamesByTournamentId } from "@/db/repositories/group";
import { getLatestTournament } from "@/db/repositories/tournament";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await authWithRedirect();

  if (session.user.role !== "admin") {
    redirect("/uebersicht");
  }
  const tournament = await getLatestTournament();

  if (!tournament) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Paarungen</h1>
        <p className="text-gray-600">Kein aktives Turnier gefunden.</p>
      </div>
    );
  }
  const groups = await getGroupsWithParticipantsAndGamesByTournamentId(
    tournament.id,
  );

  if (groups.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Paarungen</h1>
        <div className="text-center py-8 text-gray-500">
          Keine Gruppen gefunden. Erstelle zuerst Gruppen.
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Paarungen</h1>
      </div>
      <PairingContainer tournamentId={tournament.id} groups={groups} />
    </div>
  );
}
