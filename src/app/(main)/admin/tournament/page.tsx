import { authWithRedirect } from "@/auth/utils";
import { EditGroups } from "@/components/admin/tournament/edit-groups";
import { PairingsOverview } from "@/components/admin/tournament/pairings-overview";
import EditTournamentDetails from "@/components/admin/tournament/edit-tournament-details";
import { TournamentStageManager } from "@/components/admin/tournament/tournament-stage-manager";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDownIcon } from "lucide-react";
import { getProfilesByUserRole } from "@/db/repositories/profile";
import { getLatestTournament } from "@/db/repositories/tournament";
import { getGroupsByTournamentId } from "@/db/repositories/group";
import { Participants } from "@/components/participants/participants";
import { Tournament } from "@/db/types/tournament";
import { getParticipantsByTournamentId } from "@/db/repositories/participant";

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

      <Tabs defaultValue="tournament">
        <TabsList>
          <TabsTrigger value="tournament">Turnier</TabsTrigger>
          <TabsTrigger disabled={tournament == null} value="players">
            Teilnehmer
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tournament">
          <ManageTournament tournament={tournament} />
        </TabsContent>
        {tournament ? (
          <TabsContent value="players">
            <ParticipantsList tournamentId={tournament.id} />
          </TabsContent>
        ) : null}
      </Tabs>
    </div>
  );
}

async function ManageTournament({
  tournament,
}: {
  tournament?: Tournament;
}) {
  const adminProfiles = await getProfilesByUserRole("admin");
  const groups = tournament ? await getGroupsByTournamentId(tournament.id) : [];

  const openCollapsible =
    tournament == null
      ? "details"
      : groups.length > 0
        ? "pairings"
        : "groups";

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
          <EditTournamentDetails profiles={adminProfiles} />
        </CollapsibleContent>
      </Collapsible>
      <Collapsible
        defaultOpen={openCollapsible === "groups"}
        className="border border-primary rounded-md p-4"
      >
        <CollapsibleTrigger className="w-full">
          <div className="flex">
            <span className="flex-grow text-left">Gruppen verwalten</span>
            <ChevronDownIcon />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4">
          {tournament ? (
            <EditGroups tournament={tournament} />
          ) : null}
        </CollapsibleContent>
      </Collapsible>
      <Collapsible
        defaultOpen={openCollapsible === "pairings"}
        className="border border-primary rounded-md p-4"
      >
        <CollapsibleTrigger className="w-full">
          <div className="flex">
            <span className="flex-grow text-left">Paarungen generieren</span>
            <ChevronDownIcon />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4">
          {tournament ? (
            <PairingsOverview tournament={tournament} />
          ) : null}
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
          ) : null}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

async function ParticipantsList({ tournamentId }: { tournamentId: number }) {
  const participants = await getParticipantsByTournamentId(tournamentId);
  return <Participants participants={participants} />;
}
