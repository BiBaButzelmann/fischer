import { auth } from "@/auth/utils";
import { EditGroups } from "@/components/admin/tournament/edit-groups";
import { EditPairings } from "@/components/admin/tournament/edit-pairings";
import EditTournamentDetails from "@/components/admin/tournament/edit-tournament-details";
import { ParticipantsList } from "@/components/admin/tournament/participants-list";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/db/client";
import { user } from "@/db/schema/auth";
import { profile } from "@/db/schema/profile";
import { eq, getTableColumns } from "drizzle-orm";
import { ChevronDownIcon } from "lucide-react";

export default async function Page() {
  await auth();

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
  const activeTournament = await db.query.tournament.findFirst({
    where: (tournament, { or, eq }) =>
      or(eq(tournament.stage, "registration"), eq(tournament.stage, "running")),
  });

  const adminProfiles = await db
    .select(getTableColumns(profile))
    .from(profile)
    .leftJoin(user, eq(profile.userId, user.id))
    .where(eq(user.role, "admin"));

  // TODO: improve default open logic
  // no active tournament -> open edit tournament details
  // active tournament -> open edit groups
  // valid groups (same size + match days are set) -> open generate matches
  return (
    <div className="space-y-4">
      <Collapsible
        defaultOpen={activeTournament == null}
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
        defaultOpen={activeTournament != null}
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
      <Collapsible className="border border-primary rounded-md p-4">
        <CollapsibleTrigger className="w-full">
          <div className="flex">
            <span className="flex-grow text-left">Paarungen generieren</span>
            <ChevronDownIcon />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4">
          {activeTournament ? (
            <EditPairings tournament={activeTournament} />
          ) : null}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
