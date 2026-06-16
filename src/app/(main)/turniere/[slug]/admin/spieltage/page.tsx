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
          Spieltagsverwaltung
        </h1>
        <p>Kein aktives Turnier gefunden.</p>
      </div>
    );
  }

  const [referees, rawMatchdays, setupHelpers] = await Promise.all([
    getRefereesByTournamentId(tournament.id),
    getMatchdaysWithRefereeAndSetupHelpersByTournamentId(tournament.id),
    getAllSetupHelpersByTournamentId(tournament.id),
  ]);

  const matchdays = rawMatchdays.map(({ referees, ...matchday }) => ({
    ...matchday,
    referee: referees?.referee || null,
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Spieltagsverwaltung
        </h1>
        <p className="text-gray-600">
          Spieltage für {tournament.name} verwalten
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
