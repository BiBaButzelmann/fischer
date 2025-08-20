"use client";

import Link from "next/link";
import { formatSimpleDate } from "@/lib/date";
import { buildGameViewUrl } from "@/lib/navigation";
import { isParticipantInGame } from "@/lib/game-auth";
import type { GameWithParticipantsAndDate } from "@/db/types/game";

type Props = {
  game: GameWithParticipantsAndDate;
  participantId?: number;
  onClose?: () => void;
};

export function PendingResultItem({
  game,
  participantId: currentParticipantId,
  onClose,
}: Props) {
  const getDisplayText = () => {
    const participantInfo = currentParticipantId
      ? isParticipantInGame(game, currentParticipantId)
      : { isInGame: false, isWhite: null };

    if (!currentParticipantId || !participantInfo.isInGame) {
      return `${
        game.whiteParticipant.profile.lastName
          ? `${game.whiteParticipant.profile.firstName} ${game.whiteParticipant.profile.lastName}`
          : game.whiteParticipant.profile.firstName
      } vs. ${
        game.blackParticipant.profile.lastName
          ? `${game.blackParticipant.profile.firstName} ${game.blackParticipant.profile.lastName}`
          : game.blackParticipant.profile.firstName
      }`;
    }

    const opponentParticipant = participantInfo.isWhite
      ? game.blackParticipant
      : game.whiteParticipant;

    return `gegen ${
      opponentParticipant.profile.lastName
        ? `${opponentParticipant.profile.firstName} ${opponentParticipant.profile.lastName}`
        : opponentParticipant.profile.firstName
    }`;
  };

  return (
    <Link
      href={buildGameViewUrl({
        tournamentId: game.tournamentId,
        groupId: game.groupId,
        round: game.round,
        participantId: game.whiteParticipant.id,
      })}
      onClick={onClose}
      className="block p-4 border-b border-gray-100 dark:border-card-border last:border-b-0 hover:bg-gray-50 dark:hover:bg-card/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-grow min-w-0">
          <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
            Runde {game.round}
            <span className="text-gray-500 dark:text-gray-400 font-normal">
              {" "}
              {getDisplayText()}
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
