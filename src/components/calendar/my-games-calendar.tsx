import { GameWithParticipants } from "@/db/types/game";
import { Calendar } from ".";
import { type EventInput } from "@fullcalendar/core/index.js";
import { getParticipantFullName } from "@/lib/participant";
/*TODO: 
add personal events for 
participants -> individual game, drag and droppable for postponements,
referees -> match days, 
setups helpers -> match days
*/
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
