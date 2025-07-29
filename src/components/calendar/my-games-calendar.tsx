"use client";

import { Calendar } from ".";
import { type EventInput } from "@fullcalendar/core/index.js";
import { CalendarEvent } from "@/db/types/calendar";
import { useTransition } from "react";
import { updateGameMatchday } from "@/actions/game";
import { MatchDay } from "@/db/types/match-day";
import { toast } from "sonner";

/*TODO: 
add personal events for 
participants -> individual game, drag and droppable for postponements,
referees -> match days, 
setups helpers -> match days
*/

type Props = {
  events: CalendarEvent[];
  matchdays?: MatchDay[];
};

export function MyGamesCalendar({ events, matchdays = [] }: Props) {
  const [, startTransition] = useTransition();

  const calendarEvents: EventInput[] = events.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.start,
    extendedProps: event.extendedProps,
  }));

  const validDropDates = matchdays.map((matchday) => matchday.date);

  const handleEventDrop = async (gameId: number, newDate: Date) => {
    const targetMatchday = matchdays.find(
      (matchday) => matchday.date.toDateString() === newDate.toDateString(),
    ) as MatchDay;

    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        try {
          await updateGameMatchday(gameId, targetMatchday.id);
          toast.success("Spiel erfolgreich verschoben!");
          resolve();
        } catch (error) {
          toast.error("Fehler beim Verschieben des Spiels.");
          reject(error);
        }
      });
    });
  };

  return (
    <div className="space-y-4">
      <Calendar
        events={calendarEvents}
        onEventDrop={handleEventDrop}
        validDropDates={validDropDates}
      />
    </div>
  );
}
