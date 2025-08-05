import { authWithRedirect } from "@/auth/utils";
import { getLatestTournament } from "@/db/repositories/tournament";
import { getRefereesByTournamentId } from "@/db/repositories/referee";
import { getMatchdaysWithRefereeAndSetupHelpersByTournamentId } from "@/db/repositories/match-day";
import { getAllSetupHelpersByTournamentId } from "@/db/repositories/setup-helper";
import { MatchdayAssignmentForm } from "@/components/admin/matchday/matchday-assignment-form";

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

  const [referees, matchdays, setupHelpers] = await Promise.all([
    getRefereesByTournamentId(tournament.id),
    getMatchdaysWithRefereeAndSetupHelpersByTournamentId(tournament.id),
    getAllSetupHelpersByTournamentId(tournament.id),
  ]);

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
      <MatchdayAssignmentForm
        referees={referees}
        matchdays={matchdays}
        setupHelpers={setupHelpers}
      />
    </div>
  );
}
