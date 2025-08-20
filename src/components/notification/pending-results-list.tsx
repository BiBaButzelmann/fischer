"use client";

import { PendingResultItem } from "@/components/notification/pending-result-item";

type Props = {
  gameIds: number[];
  participantId?: number;
  onClick?: () => void;
};

export function PendingResultsList({ gameIds, participantId, onClick }: Props) {
  return (
    <>
      <div className="px-4 py-3 border-b border-gray-200 dark:border-card-border">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Ausstehende Ergebnismeldungen
        </h3>
      </div>
      {gameIds.map((gameId) => (
        <PendingResultItem
          key={gameId}
          gameId={gameId}
          participantId={participantId}
          onClick={onClick}
        />
      ))}
    </>
  );
}
