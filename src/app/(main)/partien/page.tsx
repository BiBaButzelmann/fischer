import { getAllActiveTournamentNames } from "@/db/repositories/tournament";
import {
  getAllGroupNamesByTournamentId,
  getGamesByTournamentId,
} from "@/db/repositories/game";
import { PartienSelector } from "@/components/partien/partien-selector";
import { GamesList } from "@/components/partien/games-list";
import { PrintGamesButton } from "@/components/partien/print-games-button";
import { updateGameResult } from "@/actions/game";
import { getParticipantsByGroupId } from "@/db/repositories/participant";
import { getRolesByUserId } from "@/db/repositories/role";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { getAllMatchdaysByTournamentId } from "@/db/repositories/match-day";
import { auth } from "@/auth/utils";
import { MassPgnDownloadButton } from "@/components/partien/mass-pgn-download-button";
import { canUserViewGames } from "@/lib/game-auth";

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

  const queryData = {
    tournamentId: parseInt(selectedTournamentId),
    groupId: groupId ? parseInt(selectedGroup) : undefined,
    round: round ? parseInt(round) : undefined,
    participantId: participantId ? parseInt(participantId) : undefined,
    matchdayId: matchdayId ? parseInt(matchdayId) : undefined,
  };

  // TODO: Refactor conditional data loading - this should be handled by separate components
  const [participants, games, userRoles] = await Promise.all([
    selectedGroup
      ? getParticipantsByGroupId(Number(selectedGroup))
      : Promise.resolve([]),
    getGamesByTournamentId(
      queryData.tournamentId,
      queryData.groupId,
      queryData.matchdayId,
      queryData.round,
      queryData.participantId,
    ),
    session?.user.id ? getRolesByUserId(session.user.id) : Promise.resolve([]),
  ]);

  return (
    <div>
      <div className="flex items-center w-full gap-2">
        <h1 className="flex-1 text-3xl font-bold text-gray-900 mb-4">
          Partien
        </h1>
        <div className="flex items-center gap-2 mb-4">
          {session?.user.id && canUserViewGames(userRoles) && (
            <MassPgnDownloadButton games={games} query={queryData} />
          )}
          <PrintGamesButton
            tournamentId={queryData.tournamentId}
            groupId={queryData.groupId}
            round={queryData.round}
            participantId={queryData.participantId}
            matchdayId={queryData.matchdayId}
          />
        </div>
      </div>
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
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        ) : (
          <div>Keine Partien gefunden</div>
        )}
      </div>
    </div>
  );
}
