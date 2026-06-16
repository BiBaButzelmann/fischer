import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getAllActiveTournamentNames,
  getTournamentById,
} from "@/db/repositories/tournament";
import { getAllGroupNamesByTournamentId } from "@/db/repositories/game";
import { StandingsDisplay } from "@/components/standings/standings-display";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    tournamentId?: string;
    groupId?: string;
    round?: string;
  }>;
}) {
  const { tournamentId, groupId, round } = await searchParams;
  const tournamentNames = await getAllActiveTournamentNames();

  if (tournamentNames.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <div className="mb-4">
          Das Turnier befindet sich noch in der Anmeldephase.
        </div>
        <div className="text-sm text-gray-600">
          <p className="mb-2">
            Du findest die Turniere der vorherigen Jahre unter:{" "}
            <a
              href="https://hsk1830.de/spielbetrieb/turniere/klubturnier"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              hsk1830.de/spielbetrieb/turniere/klubturnier
            </a>
          </p>
          <p>Diese Seite wird die Rangliste ab dem 02.09.2025 hier anzeigen.</p>
        </div>
      </div>
    );
  }

  const selectedTournamentId = tournamentId
    ? tournamentId
    : tournamentNames[0].id.toString();

  const groups = await getAllGroupNamesByTournamentId(
    Number(selectedTournamentId),
  );

  const selectedTournamentName =
    tournamentNames.find((t) => t.id.toString() === selectedTournamentId) ||
    tournamentNames[0];

  const tournament = await getTournamentById(selectedTournamentName.id);

  if (!tournament) {
    return (
      <div className="bg-background text-foreground h-full p-4 sm:p-6 md:p-8 flex items-center justify-center">
        <div className="text-center text-lg text-muted-foreground">
          Turnier nicht gefunden.
        </div>
      </div>
    );
  }

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
                  Die Gruppen werden am <strong>02.09.2025</strong> bekannt
                  gegeben.
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
    { length: selectedTournamentName.numberOfRounds },
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
        tournamentNames={tournamentNames}
        groups={groups}
        rounds={rounds}
        selectedTournamentId={selectedTournamentId}
        selectedGroupId={selectedGroupId}
        selectedRound={selectedRound}
      />
    </div>
  );
}
