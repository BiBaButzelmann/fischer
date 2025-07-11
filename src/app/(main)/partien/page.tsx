import { getAllTournamentNames } from "@/db/repositories/tournament";
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

  const tournamentNames = await getAllTournamentNames();
  if (tournamentNames.length === 0) {
    return <div>Keine Turniere gefunden</div>;
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
              userId={session?.user.id}
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
