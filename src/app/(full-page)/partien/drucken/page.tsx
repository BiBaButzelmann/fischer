import { PrintButton } from "@/components/partien/print/print-button";
import { Badge } from "@/components/ui/badge";
import { getGamesByTournamentId } from "@/db/repositories/game";
import { getParticipantFullName } from "@/lib/participant";

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

  const games = await getGamesByTournamentId(
    Number(tournamentId),
    groupId ? Number(groupId) : undefined,
    matchdayId ? Number(matchdayId) : undefined,
    round != null ? Number(round) : undefined,
    participantId != null ? Number(participantId) : undefined,
  );

  return (
    <div>
      <div className="print:hidden">
        <PrintButton />
      </div>
      <div className="w-[210mm] text-sm">
        <div className="flex items-center text-muted-foreground py-1.5 border-b font-medium">
          <div className="basis-28 text-center">Gruppe</div>
          <div className="basis-28 text-center">Brett</div>
          <div className="flex-1">Weiß</div>
          <div className="flex-1">Schwarz</div>
        </div>
        <div>
          {games.map((game) => (
            <div
              key={game.id}
              className="flex items-center py-1.5 even:bg-gray-100"
            >
              <div className="basis-28 text-center">
                <Badge variant="secondary">{game.group.groupName}</Badge>
              </div>
              <div className="basis-28 text-center">
                <Badge variant="outline">{game.boardNumber}</Badge>
              </div>
              <div className="flex-1 truncate">
                {getParticipantFullName(game.whiteParticipant!)}
              </div>
              <div className="flex-1 truncate">
                {getParticipantFullName(game.blackParticipant!)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
