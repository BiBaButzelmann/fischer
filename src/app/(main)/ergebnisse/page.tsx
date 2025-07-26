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
import { getAllGroupNamesByTournamentId } from "@/db/repositories/game";

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
      <div className="bg-background text-foreground min-h-screen p-4 sm:p-6 md:p-8 flex items-center justify-center">
        <div className="text-center text-lg text-muted-foreground">
          Kein Turnier gefunden.
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
      <div className="bg-background text-foreground min-h-screen p-4 sm:p-6 md:p-8 flex items-center justify-center">
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

  return (
    <div className="bg-background text-foreground min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Ergebnisse
            </CardTitle>
            <CardDescription>
              Wählen Sie ein Turnier, eine Gruppe und eine Runde aus, um die
              Ergebnisse anzuzeigen.
            </CardDescription>
          </CardHeader>
          <Results
            initialTournament={tournament}
            tournamentNames={tournamentNames}
            groups={groups}
            rounds={rounds}
            selectedTournamentId={selectedTournamentId}
            selectedGroupId={selectedGroupId}
            selectedRound={round}
          />
        </Card>
      </div>
    </div>
  );
}
