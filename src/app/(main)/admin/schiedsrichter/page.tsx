import { authWithRedirect } from "@/auth/utils";
import { getLatestTournament } from "@/db/repositories/tournament";
import { getRefereesByTournamentId } from "@/db/repositories/referee";
import { getRefereeAssignmentsByTournamentId } from "@/db/repositories/match-day";
import { RefereeAssignmentForm } from "@/components/admin/referee/referee-assignment-form";

export default async function Page() {
  await authWithRedirect();

  const tournament = await getLatestTournament();

  if (!tournament) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Schiedsrichterverwaltung
        </h1>
        <p>Kein aktives Turnier gefunden.</p>
      </div>
    );
  }

  const referees = await getRefereesByTournamentId(tournament.id);

  const currentAssignments = await getRefereeAssignmentsByTournamentId(
    tournament.id,
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Schiedsrichterverwaltung
        </h1>
        <p className="text-gray-600">
          Schiedsrichter für {tournament.name} zuweisen
        </p>
      </div>
      {/* TODO: es muss eine Möglichkeit geben, granularer Schiedsrichtern Spieltage zuzuweisen. Gerade für Nachholwochen müuss es möglich sein, anderen Schiedsrichtern die Termine einzustellen */}
      <RefereeAssignmentForm
        tournamentId={tournament.id}
        referees={referees}
        currentAssignments={currentAssignments}
      />
    </div>
  );
}
