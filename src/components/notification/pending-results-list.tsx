"use client";

import { PendingResultItem } from "@/components/notification/pending-result-item";
import type { GameWithParticipantsAndDate } from "@/db/types/game";

type Props = {
  games: GameWithParticipantsAndDate[];
  participantId?: number;
  onClick?: () => void;
};

export function PendingResultsList({ games, participantId, onClick }: Props) {
  return (
    <>
      <div className="px-4 py-3 border-b border-gray-200 dark:border-card-border">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Ausstehende Ergebnismeldungen
        </h3>
      </div>
      {games.map((game) => (
        <PendingResultItem
          key={game.id}
          game={game}
          participantId={participantId}
          onClick={onClick}
        />
      ))}
    </>
  );
}
