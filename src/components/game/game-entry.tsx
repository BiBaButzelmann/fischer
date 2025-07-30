import { GameWithParticipants } from "@/db/types/game";
import { formatGameTime } from "@/lib/game-time";

export function GameEntry({ game }: { game: GameWithParticipants }) {
  const timeDisplay = formatGameTime();

  return (
    <div className="flex items-center gap-2">
      <span className="font-semibold">{game.boardNumber}</span>
      <span>
        Runde {game.round}
        {timeDisplay}
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
