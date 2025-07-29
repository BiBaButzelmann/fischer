import { GameWithParticipants } from "@/db/types/game";

export function GameEntry({ game }: { game: GameWithParticipants }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-semibold">{game.boardNumber}</span>
      <span>
        Runde {game.round} {/* TODO: Add matchday relation */}
        19:00 Uhr
      </span>
      <span>
        {game.whiteParticipant.profile.firstName}{" "}
        {game.whiteParticipant.profile.lastName} vs{" "}
        {game.blackParticipant.profile.firstName}{" "}
        {game.blackParticipant.profile.lastName}
      </span>
    </div>
  );
}
