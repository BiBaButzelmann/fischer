import { authWithRedirect } from "@/auth/utils";
import { TournamentStageManager } from "@/components/admin/tournament/tournament-stage-manager";
import TournamentDetailsManager from "@/components/admin/tournament/tournament-details-manager";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDownIcon } from "lucide-react";
import { getProfilesByUserRole } from "@/db/repositories/profile";
import { getLatestTournament } from "@/db/repositories/tournament";
import { getGroupsWithParticipantsByTournamentId } from "@/db/repositories/group";
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

      <Collapsible
        defaultOpen={false}
        className="border border-primary rounded-md p-4"
      >
        <CollapsibleTrigger className="w-full">
          <div className="flex">
            <span className="flex-grow text-left">Turnierphase verwalten</span>
            <ChevronDownIcon />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4">
          {tournament ? (
            <TournamentStageManager tournament={tournament} />
          ) : (
            <div>
              <p className="text-sm text-gray-600">
                Kein aktives Turnier gefunden. Bitte erstelle ein neues Turnier.
              </p>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
