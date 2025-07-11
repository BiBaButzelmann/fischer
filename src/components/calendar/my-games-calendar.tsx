import { GameWithParticipants } from "@/db/types/game";
import { Calendar } from ".";
import { type EventInput } from "@fullcalendar/core/index.js";
import { getParticipantFullName } from "@/lib/participant";

export function MyGamesCalendar({ games }: { games: GameWithParticipants[] }) {
  const events = games.map(
    (game) =>
      ({
        title: `${getParticipantFullName(game.whiteParticipant)} vs. ${getParticipantFullName(game.blackParticipant)}`,
        start: game.scheduled,
      }) satisfies EventInput,
  );

  return <Calendar events={events} />;
}
