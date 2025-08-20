"use client";

import { PendingResultItem } from "@/components/notification/pending-result-item";
import type { GameWithParticipantsAndDate } from "@/db/types/game";

type Props = {
  games: GameWithParticipantsAndDate[];
  currentParticipantId: number;
};

export function PendingResultsList({ games, currentParticipantId }: Props) {
  if (games.length === 0) {
    return (
      <div className="absolute right-0 top-12 w-96 bg-white dark:bg-card border border-gray-200 dark:border-card-border rounded-lg shadow-lg z-50">
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          Keine Aufgaben
        </div>
      </div>
    );
  }

  return (
    <div className="absolute right-0 top-12 w-96 bg-white dark:bg-card border border-gray-200 dark:border-card-border rounded-lg shadow-lg z-50">
      <div className="max-h-96 overflow-y-auto">
        {games.map((game) => (
          <PendingResultItem
            key={game.id}
            game={game}
            currentParticipantId={currentParticipantId}
          />
        ))}
      </div>
    </div>
  );
}
