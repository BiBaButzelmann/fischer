import { authWithRedirect } from "@/auth/utils";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getAllProfiles,
  getAllParticipantsByTournamentId,
  getAllRefereesByTournamentId,
  getAllJurorsByTournamentId,
  getAllMatchEnteringHelpersByTournamentId,
  getAllSetupHelpersByTournamentId,
  getAllTrainersByTournamentId,
  getDeactivatedProfilesByTournamentId,
} from "@/db/repositories/admin";
import { getTournamentBySlug } from "@/db/repositories/tournament";
import { tournamentPath } from "@/lib/navigation";
import { User, Users, UserX, LucideIcon } from "lucide-react";
import { UserRow } from "@/components/admin/user-row";
import { ParticipantRow } from "@/components/admin/participant-row";
import { RatingUpdatePanel } from "@/components/admin/rating-update-panel";
import { RoleRoster } from "@/components/admin/user-management/role-roster";
import {
  RosterTab,
  RosterTabsList,
} from "@/components/admin/user-management/roster-tabs";
import { formatMatchDays } from "@/lib/match-days";
import { redirect } from "next/navigation";
import { ProfileWithName } from "@/db/types/profile";
import { ParticipantWithProfile } from "@/db/types/participant";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await authWithRedirect();
  const { slug } = await params;

  if (session.user.role !== "admin") {
    redirect(tournamentPath(slug, "/uebersicht"));
  }

  const [tournament, allProfiles] = await Promise.all([
    getTournamentBySlug(slug),
    getAllProfiles(),
  ]);

  if (!tournament) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Nutzerverwaltung
          </h1>
          <p className="text-gray-600">
            Verwalten Sie alle Benutzer und deren Rollen im System.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">
              Kein aktives Turnier gefunden. Erstelle zuerst ein Turnier.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [
    participants,
    referees,
    jurors,
    matchEnteringHelpers,
    setupHelpers,
    trainers,
    disabledProfiles,
  ] = await Promise.all([
    getAllParticipantsByTournamentId(tournament.id),
    getAllRefereesByTournamentId(tournament.id),
    getAllJurorsByTournamentId(tournament.id),
    getAllMatchEnteringHelpersByTournamentId(tournament.id),
    getAllSetupHelpersByTournamentId(tournament.id),
    getAllTrainersByTournamentId(tournament.id),
    getDeactivatedProfilesByTournamentId(tournament.id),
  ]);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Nutzerverwaltung
        </h1>
        <p className="text-sm text-muted-foreground">{tournament.name}</p>
      </header>

      <Tabs defaultValue="participants" className="space-y-5">
        <RosterTabsList>
          <RosterTab
            value="participants"
            label="Teilnehmer"
            count={participants.length}
          />
          <RosterTab
            value="referees"
            label="Schiedsrichter"
            count={referees.length}
          />
          <RosterTab value="jurors" label="Juroren" count={jurors.length} />
          <RosterTab
            value="matchEnteringHelpers"
            label="Eingabehelfer"
            count={matchEnteringHelpers.length}
          />
          <RosterTab
            value="setupHelpers"
            label="Aufbauhelfer"
            count={setupHelpers.length}
          />
          <RosterTab value="trainers" label="Trainer" count={trainers.length} />
          <RosterTab
            value="disabled"
            label="Deaktiviert"
            count={disabledProfiles.length}
          />
          <RosterTab
            value="profiles"
            label="Alle Profile"
            count={allProfiles.length}
          />
        </RosterTabsList>

        <TabsContent value="participants" className="mt-0">
          <ParticipantList
            participants={participants}
            title="Teilnehmer"
            description={`${participants.length} Spieler sind für das Turnier angemeldet`}
            icon={User}
            emptyMessage="Keine Teilnehmer für dieses Turnier gefunden."
            tournamentId={tournament.id}
          />
        </TabsContent>

        <TabsContent value="referees" className="mt-0">
          <RoleRoster
            members={referees.map((referee) => ({
              id: referee.id,
              profile: referee.profile,
              meta: formatMatchDays(
                referee.preferredMatchDay,
                referee.secondaryMatchDays,
              ),
            }))}
            tournament={tournament}
            emptyMessage="Für dieses Turnier hat sich kein Schiedsrichter gemeldet."
          />
        </TabsContent>

        <TabsContent value="jurors" className="mt-0">
          <RoleRoster
            members={jurors}
            tournament={tournament}
            emptyMessage="Für dieses Turnier gibt es noch kein Turniergericht."
          />
        </TabsContent>

        <TabsContent value="matchEnteringHelpers" className="mt-0">
          <RoleRoster
            members={matchEnteringHelpers.map((helper) => ({
              id: helper.id,
              profile: helper.profile,
              meta:
                helper.numberOfGroupsToEnter === 1
                  ? "1 Gruppe"
                  : `${helper.numberOfGroupsToEnter} Gruppen`,
            }))}
            tournament={tournament}
            emptyMessage="Für dieses Turnier hat sich kein Eingabehelfer gemeldet."
          />
        </TabsContent>

        <TabsContent value="setupHelpers" className="mt-0">
          <RoleRoster
            members={setupHelpers.map((helper) => ({
              id: helper.id,
              profile: helper.profile,
              meta: formatMatchDays(
                helper.preferredMatchDay,
                helper.secondaryMatchDays,
              ),
            }))}
            tournament={tournament}
            emptyMessage="Für dieses Turnier hat sich kein Aufbauhelfer gemeldet."
          />
        </TabsContent>

        <TabsContent value="trainers" className="mt-0">
          <RoleRoster
            members={trainers}
            tournament={tournament}
            emptyMessage="Für dieses Turnier ist kein Trainer eingetragen."
            description="Trainer sehen alle Partien des Turniers. Eintragen und entfernen unter „Alle Profile“."
          />
        </TabsContent>

        <TabsContent value="disabled" className="mt-0">
          <UserList
            users={disabledProfiles}
            title="Deaktivierte Benutzer"
            description={`${disabledProfiles.length} Benutzer sind in diesem Turnier deaktiviert`}
            icon={UserX}
            emptyMessage="Keine deaktivierten Benutzer gefunden."
            isDisabledUsers={true}
            tournamentId={tournament.id}
            trainers={[]}
          />
        </TabsContent>

        <TabsContent value="profiles" className="mt-0">
          <UserList
            users={allProfiles}
            title="Alle Profile"
            description={`Gesamtübersicht aller ${allProfiles.length} registrierten Benutzerprofile`}
            icon={Users}
            emptyMessage="Keine Profile gefunden."
            tournamentId={tournament.id}
            trainers={trainers}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UserList({
  users,
  title,
  description,
  icon: Icon,
  emptyMessage,
  isDisabledUsers = false,
  tournamentId,
  trainers,
}: {
  users: ProfileWithName[];
  title: string;
  description: string;
  icon: LucideIcon;
  emptyMessage: string;
  isDisabledUsers?: boolean;
  tournamentId: number;
  trainers: { profile: { id: number }; id: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 border border-gray-200 rounded-lg">
            <Icon className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <p className="text-gray-500 text-sm italic">{emptyMessage}</p>
        ) : (
          <div className="space-y-1">
            {users.map((user) => {
              const trainer = trainers.find((t) => t.profile.id === user.id);
              return (
                <UserRow
                  key={user.id}
                  user={user}
                  showDeleteActions={!isDisabledUsers}
                  tournamentId={tournamentId}
                  trainerId={trainer?.id}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ParticipantList({
  participants,
  title,
  description,
  icon: Icon,
  emptyMessage,
  tournamentId,
}: {
  participants: ParticipantWithProfile[];
  title: string;
  description: string;
  icon: LucideIcon;
  emptyMessage: string;
  tournamentId: number;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 border border-gray-200 rounded-lg">
            <Icon className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {participants.length === 0 ? (
          <p className="text-gray-500 text-sm italic">{emptyMessage}</p>
        ) : (
          <div className="space-y-4">
            <RatingUpdatePanel participants={participants} />
            <div className="space-y-1">
              {participants.map((participant) => (
                <ParticipantRow
                  key={participant.id}
                  participant={participant}
                  showDeleteActions={true}
                  tournamentId={tournamentId}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
