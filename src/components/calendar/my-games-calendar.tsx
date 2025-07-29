import { Calendar } from ".";
import { type EventInput } from "@fullcalendar/core/index.js";
import { CalendarEvent } from "@/db/types/calendar";

/*TODO: 
add personal events for 
participants -> individual game, drag and droppable for postponements,
referees -> match days, 
setups helpers -> match days
*/

type Props = {
  events: CalendarEvent[];
};

export function MyGamesCalendar({ events }: Props) {
  const calendarEvents: EventInput[] = events.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.start,
    extendedProps: event.extendedProps,
  }));

  return <Calendar events={calendarEvents} />;
}
