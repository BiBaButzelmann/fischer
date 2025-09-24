import { PrintButton } from "@/components/partien/print/print-button";
import { Badge } from "@/components/ui/badge";
import { getGamesByTournamentId } from "@/db/repositories/game";
import { toDateString } from "@/lib/date";
import { getDateTimeFromTournamentTime } from "@/lib/game-time";
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

  const gamesWithDates = games.map((game) => ({
    ...game,
    gameDateTime: getDateTimeFromTournamentTime(
      game.matchdayGame.matchday.date,
      game.tournament.gameStartTime,
    ),
  }));

  return (
    <div className="flex gap-4 p-4 print:p-0">
      <div className="w-[210mm] text-sm">
        <div className="flex items-center text-muted-foreground py-1.5 border-b font-medium">
          <div className="basis-[8rem] text-center">Datum</div>
          <div className="basis-16 text-center">Gruppe</div>
          <div className="basis-20 text-center">Brett</div>
          <div className="flex-1">Weiß</div>
          <div className="basis-20 text-center">Ergebnis</div>
          <div className="flex-1 text-right pr-8">Schwarz</div>
        </div>
        <div>
          {gamesWithDates.map((game) => (
            <div
              key={game.id}
              className="flex items-center py-1 even:bg-gray-100 h-[15mm]"
            >
              <div className="basis-[8rem] text-center">
                {toDateString(game.gameDateTime)}
              </div>
              <div className="basis-16 text-center">
                <Badge variant="secondary">{game.group.groupName}</Badge>
              </div>
              <div className="basis-20 text-center">
                <Badge variant="outline">{game.boardNumber}</Badge>
              </div>
              <div className="flex-1 truncate">
                {getParticipantFullName(game.whiteParticipant!)}
              </div>
              <div className="basis-20 flex gap-2 h-full py-2 items-center">
                <div className="flex-1 border border-gray-500 h-full"></div>
                <span>:</span>
                <div className="flex-1 border border-gray-500 h-full"></div>
              </div>
              <div className="flex-1 truncate text-right pr-8">
                {getParticipantFullName(game.blackParticipant!)}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="print:hidden">
        <PrintButton />
      </div>
    </div>
  );
}
