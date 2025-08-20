"use client";

import { PendingResultItem } from "@/components/notification/pending-result-item";
import type { GameWithParticipantsAndDate } from "@/db/types/game";

type Props = {
  games: GameWithParticipantsAndDate[];
  participantId?: number;
};

export function PendingResultsList({ games, participantId }: Props) {
  return (
    <>
      {games.map((game) => (
        <PendingResultItem
          key={game.id}
          game={game}
          participantId={participantId}
        />
      ))}
    </>
  );
}
