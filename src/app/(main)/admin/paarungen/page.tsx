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
  const groupsData = await getGroupsWithParticipantsAndGamesByTournamentId(
    tournament.id,
  );

  if (groupsData.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Paarungen</h1>
        <div className="text-center py-8 text-gray-500">
          Keine Gruppen gefunden. Erstelle zuerst Gruppen.
        </div>
      </div>
    );
  }

  const unscheduledGames = [];
  for (const group of groupsData) {
    for (const game of group.games) {
      if (!game.matchdayGame?.matchday?.date) {
        unscheduledGames.push({
          gameId: game.id,
          groupName: group.groupName || `Gruppe ${group.groupNumber}`,
          round: game.round,
          boardNumber: game.boardNumber,
        });
      }
    }
  }

  if (unscheduledGames.length > 0) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Paarungen</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <svg
              className="w-6 h-6 text-yellow-600 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <h2 className="text-lg font-semibold text-yellow-800">
              Nicht alle Spiele sind geplant
            </h2>
          </div>
          <p className="text-yellow-700 mb-4">
            Die folgenden Spiele sind noch nicht zu Spieltagen zugeordnet. Bitte
            ordnen Sie alle Spiele zu Spieltagen zu, bevor Sie die Paarungen
            anzeigen können.
          </p>
          <div className="space-y-2">
            {unscheduledGames.map((game) => (
              <div key={game.gameId} className="text-sm text-yellow-600">
                {game.groupName}, Runde {game.round}, Brett {game.boardNumber}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const groups = groupsData.map((g) => ({
    ...g,
    participants: g.participants.map((p) => p.participant),
  }));

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Paarungen</h1>
      </div>
      <PairingContainer tournamentId={tournament.id} groups={groups} />
    </div>
  );
}
