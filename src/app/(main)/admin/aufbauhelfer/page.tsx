import { authWithRedirect } from "@/auth/utils";
import { SetupHelperAssignmentForm } from "@/components/admin/setup-helper/setup-helper-assignment-form";
import {
  getAllSetupHelpersByTournamentId,
  getAssignedSetupHelpersByTournamentId,
} from "@/db/repositories/setup-helper";
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Aufbauhelferverwaltung
        </h1>
        <p>Kein aktives Turnier gefunden.</p>
      </div>
    );
  }

  const [setupHelpers, assignedSetupHelpers] = await Promise.all([
    getAllSetupHelpersByTournamentId(tournament.id),
    getAssignedSetupHelpersByTournamentId(tournament.id),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Aufbauhelferverwaltung
        </h1>
        <p className="text-gray-600">
          Aufbauhelfer für {tournament.name} zuweisen
        </p>
      </div>

      <SetupHelperAssignmentForm
        tournamentId={tournament.id}
        setupHelpers={setupHelpers}
        currentAssignments={assignedSetupHelpers}
      />
    </div>
  );
}
