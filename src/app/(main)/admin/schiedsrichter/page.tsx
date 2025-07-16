import { authWithRedirect } from "@/auth/utils";
import { getLatestTournament } from "@/db/repositories/tournament";
import { getRefereesByTournamentId } from "@/db/repositories/referee";
import { getRefereeIdByTournamentIdAndDayOfWeek } from "@/db/repositories/match-day";
import { availableMatchDays } from "@/db/schema/columns.helpers";
import { RefereeAssignmentForm } from "@/components/admin/referee/referee-assignment-form";
import type { MatchDay } from "@/db/types/group";

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

  const currentAssignments: Partial<Record<MatchDay, number | null>> = {};
  for (const day of availableMatchDays) {
    const result = await getRefereeIdByTournamentIdAndDayOfWeek(
      tournament.id,
      day,
    );
    currentAssignments[day] = result;
  }

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

      <RefereeAssignmentForm
        tournamentId={tournament.id}
        referees={referees}
        currentAssignments={currentAssignments}
      />
    </div>
  );
}
