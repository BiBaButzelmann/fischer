import Link from "next/link";
import { buildGameViewUrl } from "@/lib/navigation";
import { ParticipatingPlayerDisplay } from "./participating-player-display";
import invariant from "tiny-invariant";
import { formatDateOnly } from "@/lib/date";
import { NotificationGame } from "@/db/types/game";

type Props = {
  game: NotificationGame;
  participantId?: number;
};

export function PendingResultItem({ game, participantId }: Props) {
  invariant(
    game.whiteParticipant && game.blackParticipant,
    "Game should have both participants for pending results",
  );
  invariant(
    game.matchdayGame?.matchday?.date,
    "Game should have matchday date for pending results",
  );

  return (
    <Link
      href={buildGameViewUrl({
        slug: game.tournament.slug,
        groupId: game.groupId,
        round: game.round,
        participantId: game.whiteParticipant.id,
      })}
      className="block p-4 border-b border-gray-100 dark:border-card-border last:border-b-0 hover:bg-gray-50 dark:hover:bg-card/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-grow min-w-0">
          <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
            Runde {game.round}
            <span className="text-gray-500 dark:text-gray-400 font-normal">
              {" "}
              <ParticipatingPlayerDisplay
                game={game}
                participantId={participantId}
              />
            </span>
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Gespielt am {formatDateOnly(game.matchdayGame.matchday.date)}
          </p>
        </div>
      </div>
    </Link>
  );
}
