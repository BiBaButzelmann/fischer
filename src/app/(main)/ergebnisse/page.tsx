import { Results } from "@/components/results/results";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getAllActiveTournamentNames,
  getTournamentById,
} from "@/db/repositories/tournament";
import {
  getAllGroupNamesByTournamentId,
  getGamesForStandings,
  getParticipantsInGroup,
} from "@/db/repositories/game";
import { calculateStandings } from "@/lib/standings";

export default async function ResultsPage({
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
          <p>
            Die neue Seite wird alle Ergebnisse ab dem 02.09.2025 hier anzeigen.
          </p>
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

  const selectedGroupId =
    groupId || (groups.length > 0 ? groups[0].id.toString() : undefined);

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

  const rounds = Array.from(
    { length: selectedTournamentName.numberOfRounds },
    (_, i) => i + 1,
  );

  const standings = selectedGroupId
    ? await (async () => {
        const participants = await getParticipantsInGroup(
          Number(selectedGroupId),
        );
        const games = await getGamesForStandings(
          Number(selectedGroupId),
          round ? Number(round) : undefined,
        );
        return calculateStandings(games, participants);
      })()
    : [];

  return (
    <div className="bg-background text-foreground h-full p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Ergebnisse
            </CardTitle>
            <CardDescription>
              Wenn du keine Runde auswählst, werden die Ergebnisse aller Runden
              angezeigt. Als Feinwertungssystem wird das Sonneborn-Berger-System
              verwendet.
            </CardDescription>
          </CardHeader>
          <Results
            tournamentNames={tournamentNames}
            groups={groups}
            rounds={rounds}
            selectedTournamentId={selectedTournamentId}
            selectedGroupId={selectedGroupId}
            selectedRound={round}
            standings={standings}
          />
        </Card>
      </div>
    </div>
  );
}
