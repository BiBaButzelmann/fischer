"use client";

import { Calendar } from ".";
import { type EventInput } from "@fullcalendar/core/index.js";
import { CalendarEvent } from "@/db/types/calendar";
import { useState, useTransition } from "react";
import { updateGameMatchday } from "@/actions/game";
import { MatchDay } from "@/db/types/match-day";
import { CheckCircle, XCircle } from "lucide-react";

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
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const calendarEvents: EventInput[] = events.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.start,
    extendedProps: event.extendedProps,
  }));

  const validDropDates = matchdays
    .filter((matchday) => matchday.date >= new Date()) // Only future dates
    .map((matchday) => matchday.date);

  const handleEventDrop = async (gameId: number, newDate: Date) => {
    // Find the matchday that corresponds to the new date
    const targetMatchday = matchdays.find(
      (matchday) => matchday.date.toDateString() === newDate.toDateString(),
    );

    if (!targetMatchday) {
      throw new Error("Invalid drop target - no matchday found for this date");
    }

    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        try {
          await updateGameMatchday(gameId, targetMatchday.id);
          setMessage({
            type: "success",
            text: "Spiel erfolgreich verschoben!",
          });
          setTimeout(() => setMessage(null), 3000); // Clear message after 3 seconds
          resolve();
        } catch (error) {
          setMessage({
            type: "error",
            text: "Fehler beim Verschieben des Spiels.",
          });
          setTimeout(() => setMessage(null), 5000); // Clear error after 5 seconds
          reject(error);
        }
      });
    });
  };

  return (
    <div className="space-y-4">
      {/* Success/Error Messages */}
      {message && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <XCircle className="w-4 h-4 text-red-600" />
          )}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      <Calendar
        events={calendarEvents}
        onEventDrop={handleEventDrop}
        validDropDates={validDropDates}
      />
    </div>
  );
}
