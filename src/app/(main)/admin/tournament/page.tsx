import { authWithRedirect } from "@/auth/utils";
import { EditGroups } from "@/components/admin/tournament/edit-groups";
import { PairingsOverview } from "@/components/admin/tournament/pairings-overview";
import EditTournamentDetails from "@/components/admin/tournament/edit-tournament-details";
import { ParticipantsList } from "@/components/admin/tournament/participants-list";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDownIcon } from "lucide-react";
import { getProfilesByUserRole } from "@/db/repositories/profile";
import { getActiveTournamentWithGroups } from "@/db/repositories/tournament";

export default async function Page() {
  await authWithRedirect();

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
          <TabsTrigger value="players">Teilnehmer</TabsTrigger>
        </TabsList>
        <TabsContent value="tournament">
          <ManageTournament />
        </TabsContent>
        <TabsContent value="players">
          <ParticipantsList />
        </TabsContent>
      </Tabs>
    </div>
  );
}

async function ManageTournament() {
  const adminProfiles = await getProfilesByUserRole("admin");
  const activeTournament = await getActiveTournamentWithGroups();

  const openCollapsible =
    activeTournament == null
      ? "details"
      : activeTournament.groups.length > 0
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
          {activeTournament ? (
            <EditGroups tournament={activeTournament} />
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
          {activeTournament ? (
            <PairingsOverview tournament={activeTournament} />
          ) : null}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
