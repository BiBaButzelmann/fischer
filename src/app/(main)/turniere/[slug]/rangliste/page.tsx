import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { getTournamentBySlug } from "@/db/repositories/tournament";
import { getAllGroupNamesByTournamentId } from "@/db/repositories/game";
import { StandingsDisplay } from "@/components/standings/standings-display";
import { getGroupAnnouncementDate } from "@/lib/tournament-schedule";
import { tournamentPath } from "@/lib/navigation";
import { notFound, redirect } from "next/navigation";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    groupId?: string;
    round?: string;
  }>;
}) {
  const { slug } = await params;
  const { groupId, round } = await searchParams;

  const tournament = await getTournamentBySlug(slug);
  if (!tournament) {
    notFound();
  }

  if (tournament.stage === "done") {
    redirect(tournamentPath(slug, "/uebersicht"));
  }

  const groups = await getAllGroupNamesByTournamentId(tournament.id);

  const groupsAnnouncedAt = getGroupAnnouncementDate(tournament);

  if (groups.length === 0) {
    return (
      <div className="bg-background text-foreground h-full p-4 sm:p-6 md:p-8">
        <div className="max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold tracking-tight">
                Rangliste
              </CardTitle>
            </CardHeader>
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm text-center">
                  Die Gruppen werden am <strong>{groupsAnnouncedAt}</strong>{" "}
                  bekannt gegeben.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const selectedGroupId = groupId || groups[0].id.toString();
  const selectedRound = round;

  const rounds = Array.from(
    { length: tournament.numberOfRounds },
    (_, i) => i + 1,
  );

  return (
    <div>
      <div className="md:w-2/3 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Rangliste</h1>
        <p className="text-gray-700">
          Ohne Rundenauswahl wird die Gesamtrangliste über alle Runden
          angezeigt. Zur Feinwertung wird das Sonneborn-Berger-System verwendet.
        </p>
      </div>
      <StandingsDisplay
        groups={groups}
        rounds={rounds}
        selectedGroupId={selectedGroupId}
        selectedRound={selectedRound}
      />
    </div>
  );
}
