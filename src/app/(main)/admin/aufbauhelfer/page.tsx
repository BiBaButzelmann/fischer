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
          Schiedsrichterverwaltung
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
    <SetupHelperAssignmentForm
      tournamentId={tournament.id}
      setupHelpers={setupHelpers}
      currentAssignments={assignedSetupHelpers}
    />
  );
}
