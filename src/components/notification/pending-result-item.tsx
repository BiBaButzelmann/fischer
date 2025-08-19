"use client";

import Link from "next/link";
import { formatSimpleDate } from "@/lib/date";
import type { GameWithParticipantsAndDate } from "@/db/types/game";

type Props = {
  game: GameWithParticipantsAndDate;
  currentParticipantId: number;
};

export function PendingResultItem({ game, currentParticipantId }: Props) {
  const getOpponent = () => {
    const isUserWhite = game.whiteParticipant.id === currentParticipantId;
    const opponentParticipant = isUserWhite
      ? game.blackParticipant
      : game.whiteParticipant;

    const firstName = opponentParticipant?.profile?.firstName || "Unbekannt";
    const lastName = opponentParticipant?.profile?.lastName || "";

    return lastName ? `${firstName} ${lastName}` : firstName;
  };

  return (
    <Link
      href={`/submit-result?gameId=${game.id}`}
      className="block p-4 border-b border-gray-100 dark:border-card-border last:border-b-0 hover:bg-gray-50 dark:hover:bg-card/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-grow min-w-0">
          <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
            Runde {game.round}
            <span className="text-gray-500 dark:text-gray-400 font-normal">
              {" "}
              gegen {getOpponent()}
            </span>
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Gespielt am{" "}
            {formatSimpleDate(game.matchdayGame?.matchday?.date || new Date())}
          </p>
        </div>
      </div>
    </Link>
  );
}
