import { authWithRedirect } from "@/auth/utils";
import { MatchEnteringHelperAssignmentForm } from "@/components/admin/match-entering-helper/match-entering-helper-assignment-form";
import { getAllMatchEnteringHelpersByTournamentId } from "@/db/repositories/admin";
import { getGroupsWithMatchEnteringHelpersByTournamentId } from "@/db/repositories/group";
import { getLatestTournament } from "@/db/repositories/tournament";
import { MatchEnteringHelperWithName } from "@/db/types/match-entering-helper";
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

  const groups = await getGroupsWithMatchEnteringHelpersByTournamentId(
    tournament.id,
  );
  if (!groups || groups.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Eingabehelferverwaltung
        </h1>
        <p>Keine Gruppen für das Turnier gefunden.</p>
      </div>
    );
  }

  const assignedMatchEnteringHelpers = groups.reduce(
    (acc, group) => {
      acc[group.id] = group.matchEnteringHelpers.map(
        ({ matchEnteringHelper }) => ({
          ...matchEnteringHelper,
          name: `${matchEnteringHelper.profile.firstName} ${matchEnteringHelper.profile.lastName}`,
        }),
      );
      return acc;
    },
    {} as Record<number, MatchEnteringHelperWithName[]>,
  );

  const matchEnterinHelpers = await getAllMatchEnteringHelpersByTournamentId(
    tournament.id,
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Eingabehelferverwaltung
        </h1>
        <p className="text-gray-600">
          Eingabehelfer für {tournament.name} zuweisen
        </p>
      </div>
      <MatchEnteringHelperAssignmentForm
        tournamentId={tournament.id}
        groups={groups}
        matchEnteringHelpers={matchEnterinHelpers}
        currentAssignments={assignedMatchEnteringHelpers}
      />
    </div>
  );
}
