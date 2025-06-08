import { auth } from "@/auth";
import { EditGroups } from "@/components/admin/tournament/edit-groups";
import EditTournamentDetails from "@/components/admin/tournament/edit-tournament-details";
import { ParticipantsList } from "@/components/admin/tournament/participants-list";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/db/client";
import { user } from "@/db/schema/auth";
import { profile } from "@/db/schema/profile";
import { Participant, ParticipantWithName } from "@/db/types/participant";
import { eq, getTableColumns } from "drizzle-orm";
import { ChevronDownIcon } from "lucide-react";
import { headers } from "next/headers";
import invariant from "tiny-invariant";

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
  const adminProfiles = await db
    .select(getTableColumns(profile))
    .from(profile)
    .leftJoin(user, eq(profile.userId, user.id))
    .where(eq(user.role, "admin"));

  return (
    <div className="space-y-4">
      <Collapsible className="border border-primary rounded-md p-4">
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
      <Collapsible className="border border-primary rounded-md p-4">
        <CollapsibleTrigger className="w-full">
          <div className="flex">
            <span className="flex-grow text-left">Gruppen verwalten</span>
            <ChevronDownIcon />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <EditGroups />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
