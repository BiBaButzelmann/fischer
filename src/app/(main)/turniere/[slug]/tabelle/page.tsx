import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { getTournamentBySlug } from "@/db/repositories/tournament";
import { getAllGroupNamesByTournamentId } from "@/db/repositories/game";
import { StandingsDisplay } from "@/components/standings/standings-display";
import { StandingsSelector } from "@/components/standings/standings-selector";
import { StandingsTabs } from "@/components/standings/standings-tabs";
import { CrossTableDisplay } from "@/components/standings/cross-table-display";
import { getGroupAnnouncementDate } from "@/lib/tournament-schedule";
import type { StandingsView } from "@/lib/navigation";
import { notFound } from "next/navigation";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    groupId?: string;
    round?: string;
    view?: string;
  }>;
}) {
  const { slug } = await params;
  const { groupId, round, view: viewParam } = await searchParams;

  const tournament = await getTournamentBySlug(slug);
  if (!tournament) {
    notFound();
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
                Tabelle
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
  const view: StandingsView =
    viewParam === "kreuztabelle" ? "kreuztabelle" : "tabelle";

  const rounds = Array.from(
    { length: tournament.numberOfRounds },
    (_, i) => i + 1,
  );

  return (
    <div className="space-y-6">
      <div className="md:w-2/3">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tabelle</h1>
        <p className="text-gray-700">
          Ohne Rundenauswahl wird der Gesamtstand über alle Runden angezeigt.
          Zur Feinwertung wird das Sonneborn-Berger-System verwendet.
        </p>
      </div>

      <StandingsSelector
        groups={groups}
        rounds={rounds}
        selectedGroupId={selectedGroupId}
        selectedRound={selectedRound}
        selectedView={view}
      />

      <div className="space-y-3">
        <StandingsTabs
          view={view}
          selectedGroupId={selectedGroupId}
          selectedRound={selectedRound}
        />

        <Card className="overflow-hidden">
          {view === "kreuztabelle" ? (
            <CrossTableDisplay
              groups={groups}
              selectedGroupId={selectedGroupId}
              selectedRound={selectedRound}
            />
          ) : (
            <StandingsDisplay
              groups={groups}
              selectedGroupId={selectedGroupId}
              selectedRound={selectedRound}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
