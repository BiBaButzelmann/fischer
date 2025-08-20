import { getAllActiveTournamentNames } from "@/db/repositories/tournament";
import {
  getAllGroupNamesByTournamentId,
  getGamesByTournamentId,
} from "@/db/repositories/game";
import { PartienSelector } from "@/components/partien/partien-selector";
import { GamesList } from "@/components/partien/games-list";
import { updateGameResult } from "@/actions/game";
import { getParticipantsByGroupId } from "@/db/repositories/participant";
import { getRolesByUserId } from "@/db/repositories/role";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getAllMatchdaysByTournamentId } from "@/db/repositories/match-day";
import { auth } from "@/auth/utils";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    tournamentId: string;
    groupId?: string;
    round?: string;
    participantId?: string;
    matchdayId?: string;
  }>;
}) {
  const { tournamentId, groupId, round, participantId, matchdayId } =
    await searchParams;

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
            Diese Seite wird deine Paarungen ab dem 02.09.2025 hier anzeigen.
          </p>
        </div>
      </div>
    );
  }

  const selectedTournamentId = tournamentId
    ? tournamentId
    : tournamentNames[0].id.toString();

  const [groups, matchdays, session] = await Promise.all([
    getAllGroupNamesByTournamentId(Number(selectedTournamentId)),
    getAllMatchdaysByTournamentId(Number(selectedTournamentId)),
    auth(),
  ]);

  const selectedGroup = groupId ?? groups[0]?.id.toString();

  const rounds = Array.from(
    { length: tournamentNames[0].numberOfRounds },
    (_, i) => i + 1,
  );

  // TODO: Refactor conditional data loading - this should be handled by separate components
  const [participants, allGames, userRoles] = await Promise.all([
    //TODO: proper validation
    selectedGroup
      ? getParticipantsByGroupId(Number(selectedGroup))
      : Promise.resolve([]),
    getGamesByTournamentId(
      Number(selectedTournamentId),
      groupId ? Number(groupId) : undefined,
      matchdayId ? Number(matchdayId) : undefined,
      round != null ? Number(round) : undefined,
      participantId != null ? Number(participantId) : undefined,
    ),
    session?.user.id ? getRolesByUserId(session.user.id) : Promise.resolve([]),
  ]);

  const games = allGames.filter(
    (game) => game.whiteParticipant != null && game.blackParticipant != null,
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Partien</h1>
      <div className="flex flex-col gap-1 md:gap-2">
        <PartienSelector
          selectedTournamentId={selectedTournamentId}
          tournamentNames={tournamentNames}
          selectedGroupId={groupId}
          groups={groups}
          selectedRound={round}
          rounds={rounds}
          selectedParticipantId={participantId}
          participants={participants}
          selectedMatchdayId={matchdayId}
          matchdays={matchdays}
        />
        {games.length > 0 ? (
          <ScrollArea className="h-[calc(100vh-200px)]">
            <GamesList
              games={games}
              onResultChange={updateGameResult}
              availableMatchdays={matchdays}
              userRoles={userRoles}
            />
          </ScrollArea>
        ) : (
          <div>Keine Partien gefunden</div>
        )}
      </div>
    </div>
  );
}
