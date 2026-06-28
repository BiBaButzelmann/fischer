import { authWithRedirect } from "@/auth/utils";
import { TournamentStageManager } from "@/components/admin/tournament/tournament-stage-manager";
import TournamentDetailsManager from "@/components/admin/tournament/tournament-details-manager";
import { AssignmentMailButton } from "@/components/admin/tournament/assignment-mail-button";
import { GroupMailButton } from "@/components/admin/tournament/group-mail-button";
import { getProfilesByUserRole } from "@/db/repositories/profile";
import {
  getActiveTournament,
  getTournamentBySlug,
} from "@/db/repositories/tournament";
import { getGroupsByTournamentId } from "@/db/repositories/group";
import { Tournament } from "@/db/types/tournament";
import { getTournamentWeeksByTournamentId } from "@/db/repositories/tournamentWeek";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await authWithRedirect();
  const { slug } = await params;
  const tournament = await getTournamentBySlug(slug);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Turnierverwaltung
        </h1>
      </div>

      <ManageTournament tournament={tournament} />
    </div>
  );
}

async function ManageTournament({ tournament }: { tournament?: Tournament }) {
  const adminProfiles = await getProfilesByUserRole("admin");
  const activeTournament = await getActiveTournament();
  const groupNames = tournament
    ? await getGroupsByTournamentId(tournament.id)
    : [];
  const tournamentWeeks = tournament
    ? await getTournamentWeeksByTournamentId(tournament.id)
    : [];

  return (
    <div className="space-y-4">
      <TournamentDetailsManager
        adminProfiles={adminProfiles}
        tournament={tournament}
        tournamentWeeks={tournamentWeeks}
        activeTournamentName={activeTournament?.name}
        defaultOpen={tournament == null}
      />

      <div className="border border-primary rounded-md p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Turnierphase verwalten</h2>
          <div className="flex items-center gap-2">
            {tournament && (
              <GroupMailButton tournament={tournament} groups={groupNames} />
            )}
            {tournament && <AssignmentMailButton tournament={tournament} />}
          </div>
        </div>
        {tournament ? (
          <TournamentStageManager tournament={tournament} />
        ) : (
          <div>
            <p className="text-sm text-gray-600">
              Kein aktives Turnier gefunden. Bitte erstelle ein neues Turnier.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
