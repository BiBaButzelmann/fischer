import { getAllActiveTournamentNames } from "@/db/repositories/tournament";
import {
  getAllGroupNamesByTournamentId,
  getGamesByGroup as getGamesByGroup,
} from "@/db/repositories/game";
import { PartienSelector } from "@/components/partien/partien-selector";
import { GamesList } from "@/components/partien/games-list";
import { updateGameResult } from "@/actions/game";
import { auth } from "@/auth/utils";
import { getParticipantsByGroupId } from "@/db/repositories/participant";
import { ScrollArea } from "@/components/ui/scroll-area";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    tournamentId: string;
    groupId?: string;
    round?: string;
    participantId?: string;
  }>;
}) {
  const session = await auth();
  const { tournamentId, groupId, round, participantId } = await searchParams;

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
            Die neue Seite wird deine Paarungen ab dem 02.09.2025 hier anzeigen.
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
  const selectedGroup = groupId ?? groups[0]?.id.toString();

  const rounds = Array.from(
    { length: tournamentNames[0].numberOfRounds },
    (_, i) => i + 1,
  );

  //TODO: proper validation
  const participants = await getParticipantsByGroupId(Number(selectedGroup));

  const games = await getGamesByGroup(
    Number(selectedGroup),
    round != null ? Number(round) : undefined,
    participantId != null ? Number(participantId) : undefined,
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Partien</h1>
      <div className="flex flex-col gap-1 md:gap-2">
        <PartienSelector
          selectedTournamentId={selectedTournamentId}
          tournamentNames={tournamentNames}
          selectedGroupId={selectedGroup}
          groups={groups}
          selectedRound={round}
          rounds={rounds}
          selectedParticipantId={participantId}
          participants={participants}
        />
        {games.length > 0 ? (
          <ScrollArea className="h-[calc(100vh-200px)]">
            <GamesList
              userRole={session?.user.role || undefined}
              games={games}
              onResultChange={updateGameResult}
            />
          </ScrollArea>
        ) : (
          <div>Keine Partien gefunden</div>
        )}
      </div>
    </div>
  );
}
