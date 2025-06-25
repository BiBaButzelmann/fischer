import { GameWithParticipants } from "@/db/types/game";

export function GameEntry({ game }: { game: GameWithParticipants }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-semibold">{game.boardNumber}</span>
      <span>
        {game.scheduled.toLocaleDateString("de-DE", {
          dateStyle: "short",
          timeZone: "Europe/Berlin",
        })}{" "}
        {/* TODO: don't hardcore this */}
        17:00 Uhr
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
