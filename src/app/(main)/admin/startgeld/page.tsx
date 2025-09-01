import { authWithRedirect } from "@/auth/utils";
import { EntryFeeManagement } from "@/components/admin/entry-fee-management";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getNonDefaultClubParticipantsByTournamentId } from "@/db/repositories/admin";
import { getActiveTournament } from "@/db/repositories/tournament";
import { Euro, Users } from "lucide-react";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await authWithRedirect();

  if (session.user.role !== "admin") {
    redirect("/uebersicht");
  }

  const tournament = await getActiveTournament();

  if (!tournament) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Startgeld-Verwaltung
          </h1>
          <p className="text-gray-600">
            Verwalten Sie die Startgeldzahlungen der externen Teilnehmer.
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

  const nonDefaultClubParticipants =
    await getNonDefaultClubParticipantsByTournamentId(tournament.id);

  const unpaidParticipants = nonDefaultClubParticipants.filter(
    (participant) => !participant.entryFeePayed,
  );
  const paidParticipants = nonDefaultClubParticipants.filter(
    (participant) => participant.entryFeePayed,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Startgeld-Verwaltung
        </h1>
        <p className="text-gray-600">
          Verwalten Sie die Startgeldzahlungen für externe Teilnehmer im
          Turnier: <strong>{tournament.name}</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Externe Teilnehmer
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {nonDefaultClubParticipants.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Teilnehmer aus anderen Vereinen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offen</CardTitle>
            <Euro className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {unpaidParticipants.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Startgeld noch nicht bezahlt
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bezahlt</CardTitle>
            <Euro className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {paidParticipants.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Startgeld bereits bezahlt
            </p>
          </CardContent>
        </Card>
      </div>

      <EntryFeeManagement participants={nonDefaultClubParticipants} />
    </div>
  );
}
