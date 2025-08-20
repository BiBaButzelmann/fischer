import Link from "next/link";
import { formatSimpleDate } from "@/lib/date";
import { buildGameViewUrl } from "@/lib/navigation";
import { ParticipatingPlayerDisplay } from "./participating-player-display";
import { getGameWithParticipantsAndMatchday } from "@/db/repositories/game";
import type { GameWithParticipantsAndDate } from "@/db/types/game";

type Props = {
  gameId: number;
  participantId?: number;
  onClick?: () => void;
};

export async function PendingResultItem({
  gameId,
  participantId: currentParticipantId,
  onClick,
}: Props) {
  const game = await getGameWithParticipantsAndMatchday(gameId);

  if (!game || !game.matchdayGame?.matchday?.date) {
    return null;
  }

  if (!game.whiteParticipant || !game.blackParticipant) {
    return null;
  }

  return (
    <Link
      href={buildGameViewUrl({
        tournamentId: game.tournamentId,
        groupId: game.groupId,
        round: game.round,
        participantId: game.whiteParticipant.id,
      })}
      onClick={onClick}
      className="block p-4 border-b border-gray-100 dark:border-card-border last:border-b-0 hover:bg-gray-50 dark:hover:bg-card/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-grow min-w-0">
          <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
            Runde {game.round}
            <span className="text-gray-500 dark:text-gray-400 font-normal">
              {" "}
              <ParticipatingPlayerDisplay
                game={game as GameWithParticipantsAndDate}
                participantId={currentParticipantId}
              />
            </span>
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Gespielt am {formatSimpleDate(game.matchdayGame.matchday.date)}
          </p>
        </div>
      </div>
    </Link>
  );
}
