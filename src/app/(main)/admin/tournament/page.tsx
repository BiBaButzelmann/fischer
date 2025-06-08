import { auth } from "@/auth";
import { EditGroups } from "@/components/admin/tournament/edit-groups";
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
import { headers } from "next/headers";

export default async function Page() {
  // TODO: improve this
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user.role != "admin") {
    return null;
  }

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
    where: (tournament, { gte }) => {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return gte(tournament.startDate, startOfYear);
    },
  });

  const adminProfiles = await db
    .select(getTableColumns(profile))
    .from(profile)
    .leftJoin(user, eq(profile.userId, user.id))
    .where(eq(user.role, "admin"));

  return (
    <div className="space-y-4">
      <Collapsible
        open={activeTournament == null}
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
        open={activeTournament != null}
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
      <Collapsible disabled className="border border-primary rounded-md p-4">
        <CollapsibleTrigger className="w-full">
          <div className="flex">
            <span className="flex-grow text-left">Turnier starten</span>
            <ChevronDownIcon />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4"></CollapsibleContent>
      </Collapsible>
    </div>
  );
}
