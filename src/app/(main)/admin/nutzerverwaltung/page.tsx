import { authWithRedirect } from "@/auth/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  getAllDisabledProfiles,
} from "@/db/repositories/admin";
import { getActiveTournament } from "@/db/repositories/tournament";
import {
  User,
  Users,
  Shield,
  Gavel,
  ClipboardEdit,
  Wrench,
  UserX,
  LucideIcon,
} from "lucide-react";
import { UserRow } from "@/components/admin/user-row";
import { ParticipantRow } from "@/components/admin/participant-row";
import { RatingUpdateButton } from "@/components/admin/rating-update-button";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await authWithRedirect();

  if (session.user.role !== "admin") {
    redirect("/uebersicht");
  }

  const [tournament, allProfiles, disabledProfiles] = await Promise.all([
    getActiveTournament(),
    getAllProfiles(),
    getAllDisabledProfiles(),
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

  const [participants, referees, jurors, matchEnteringHelpers, setupHelpers] =
    await Promise.all([
      getAllParticipantsByTournamentId(tournament.id),
      getAllRefereesByTournamentId(tournament.id),
      getAllJurorsByTournamentId(tournament.id),
      getAllMatchEnteringHelpersByTournamentId(tournament.id),
      getAllSetupHelpersByTournamentId(tournament.id),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Nutzerverwaltung
        </h1>
        <p className="text-gray-600">
          Verwalten Sie alle Benutzer und deren Rollen für das aktuelle Turnier:{" "}
          <strong>{tournament.name}</strong>
        </p>
      </div>

      <Tabs defaultValue="profiles" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="profiles" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="participants" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Teilnehmer
          </TabsTrigger>
          <TabsTrigger value="referees" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Schiedsrichter
          </TabsTrigger>
          <TabsTrigger value="jurors" className="flex items-center gap-2">
            <Gavel className="h-4 w-4" />
            Juroren
          </TabsTrigger>
          <TabsTrigger value="matchHelpers" className="flex items-center gap-2">
            <ClipboardEdit className="h-4 w-4" />
            Eingabehelfer
          </TabsTrigger>
          <TabsTrigger value="setupHelpers" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Aufbauhelfer
          </TabsTrigger>
          <TabsTrigger value="disabled" className="flex items-center gap-2">
            <UserX className="h-4 w-4" />
            Deaktiviert
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profiles" className="space-y-4">
          <UserList
            users={allProfiles}
            title="Alle Profile"
            description={`Gesamtübersicht aller ${allProfiles.length} registrierten Benutzerprofile`}
            icon={Users}
            emptyMessage="Keine Profile gefunden."
          />
        </TabsContent>

        <TabsContent value="participants" className="space-y-4">
          <ParticipantList
            participants={participants}
            title="Teilnehmer"
            description={`${participants.length} Spieler sind für das Turnier angemeldet`}
            icon={User}
            emptyMessage="Keine Teilnehmer für dieses Turnier gefunden."
          />
        </TabsContent>

        <TabsContent value="referees" className="space-y-4">
          <UserList
            users={referees.map((r) => r.profile)}
            title="Schiedsrichter"
            description={`${referees.length} Schiedsrichter sind für das Turnier verfügbar`}
            icon={Shield}
            emptyMessage="Keine Schiedsrichter für dieses Turnier gefunden."
          />
        </TabsContent>

        <TabsContent value="jurors" className="space-y-4">
          <UserList
            users={jurors.map((j) => j.profile)}
            title="Juroren"
            description={`${jurors.length} Juroren sind Teil des Turniergerichts`}
            icon={Gavel}
            emptyMessage="Keine Juroren für dieses Turnier gefunden."
          />
        </TabsContent>

        <TabsContent value="matchHelpers" className="space-y-4">
          <UserList
            users={matchEnteringHelpers.map((m) => m.profile)}
            title="Eingabehelfer"
            description={`${matchEnteringHelpers.length} Eingabehelfer unterstützen bei der Spieleingabe`}
            icon={ClipboardEdit}
            emptyMessage="Keine Eingabehelfer für dieses Turnier gefunden."
          />
        </TabsContent>

        <TabsContent value="setupHelpers" className="space-y-4">
          <UserList
            users={setupHelpers.map((s) => s.profile)}
            title="Aufbauhelfer"
            description={`${setupHelpers.length} Aufbauhelfer helfen bei der Turniervorbereitung`}
            icon={Wrench}
            emptyMessage="Keine Aufbauhelfer für dieses Turnier gefunden."
          />
        </TabsContent>

        <TabsContent value="disabled" className="space-y-4">
          <UserList
            users={disabledProfiles}
            title="Deaktivierte Benutzer"
            description={`${disabledProfiles.length} Benutzer wurden deaktiviert (soft delete)`}
            icon={UserX}
            emptyMessage="Keine deaktivierten Benutzer gefunden."
            isDisabledUsers={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

type ProfileWithName = {
  id: number;
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  deletedAt: Date | null;
};

type ParticipantWithRatings = {
  id: number;
  dwzRating: number | null;
  fideRating: number | null;
  zpsPlayerId: string | null;
  profile: ProfileWithName;
};

function UserList({
  users,
  title,
  description,
  icon: Icon,
  emptyMessage,
  isDisabledUsers = false,
}: {
  users: ProfileWithName[];
  title: string;
  description: string;
  icon: LucideIcon;
  emptyMessage: string;
  isDisabledUsers?: boolean;
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
            {users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                showDeleteActions={!isDisabledUsers}
              />
            ))}
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
}: {
  participants: ParticipantWithRatings[];
  title: string;
  description: string;
  icon: LucideIcon;
  emptyMessage: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 border border-gray-200 rounded-lg">
              <Icon className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
          {participants.length > 0 && (
            <RatingUpdateButton participants={participants} />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {participants.length === 0 ? (
          <p className="text-gray-500 text-sm italic">{emptyMessage}</p>
        ) : (
          <div className="space-y-1">
            {participants.map((participant) => (
              <ParticipantRow
                key={participant.id}
                participant={participant}
                showDeleteActions={true}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
