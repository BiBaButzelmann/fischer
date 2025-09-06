import { authWithRedirect } from "@/auth/utils";
import { TournamentStageManager } from "@/components/admin/tournament/tournament-stage-manager";
import TournamentDetailsManager from "@/components/admin/tournament/tournament-details-manager";
import { AssignmentMailButton } from "@/components/admin/tournament/assignment-mail-button";
import { GroupMailButton } from "@/components/admin/tournament/group-mail-button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDownIcon } from "lucide-react";
import { getProfilesByUserRole } from "@/db/repositories/profile";
import { getLatestTournament } from "@/db/repositories/tournament";
import {
  getGroupsWithParticipantsByTournamentId,
  getGroupsByTournamentId,
} from "@/db/repositories/group";
import { Tournament } from "@/db/types/tournament";
import { getTournamentWeeksByTournamentId } from "@/db/repositories/tournamentWeek";

export default async function Page() {
  await authWithRedirect();
  const tournament = await getLatestTournament();

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
  const groups = tournament
    ? await getGroupsWithParticipantsByTournamentId(tournament.id)
    : [];
  const groupNames = tournament
    ? await getGroupsByTournamentId(tournament.id)
    : [];
  const tournamentWeeks = tournament
    ? await getTournamentWeeksByTournamentId(tournament.id)
    : [];

  const openCollapsible =
    tournament == null ? "details" : groups.length > 0 ? "pairings" : "groups";

  return (
    <div className="space-y-4">
      <Collapsible
        defaultOpen={openCollapsible === "details"}
        className="border border-primary rounded-md p-4"
      >
        <CollapsibleTrigger className="w-full">
          <div className="flex">
            <span className="flex-grow text-left">
              Turnierdetails bearbeiten
            </span>
            <ChevronDownIcon />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4">
          <TournamentDetailsManager
            adminProfiles={adminProfiles}
            tournament={tournament}
            tournamentWeeks={tournamentWeeks}
          />
        </CollapsibleContent>
      </Collapsible>

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
