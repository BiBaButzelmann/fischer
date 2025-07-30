"use client";

import { Calendar } from ".";
import { type EventInput } from "@fullcalendar/core/index.js";
import { CalendarEvent } from "@/db/types/calendar";
import { useTransition } from "react";
import { updateGameMatchday } from "@/actions/game";
import { MatchDay } from "@/db/types/match-day";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

/*TODO: 
add personal events for 
referees -> match days, 
setups helpers -> match days
*/

type Props = {
  events: CalendarEvent[];
  matchdays?: MatchDay[];
};

export function MyGamesCalendar({ events, matchdays = [] }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

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

    startTransition(async () => {
      try {
        await updateGameMatchday(gameId, targetMatchday.id);
        toast.success("Spiel erfolgreich verschoben!");
      } catch {
        toast.error("Fehler beim Verschieben des Spiels.");
      }
    });
  };

  const handleEventClick = (
    gameId: number,
    participantId: number,
    round: number,
  ) => {
    const event = events.find((e) => e.extendedProps.gameId === gameId);

    if (!event) {
      toast.error("Spiel nicht gefunden.");
      return;
    }

    const url = new URL("/partien", window.location.origin);
    url.searchParams.set(
      "tournamentId",
      event.extendedProps.tournamentId.toString(),
    );
    url.searchParams.set("groupId", event.extendedProps.groupId.toString());
    url.searchParams.set("round", round.toString());
    url.searchParams.set("participantId", participantId.toString());

    router.push(url.toString());
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        {isPending && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="flex items-center gap-2 bg-white/90 px-4 py-2 rounded-lg shadow-sm">
              <Skeleton className="h-4 w-4 rounded-full" />
              <span className="text-sm text-muted-foreground">
                Ereignis wird verschoben...
              </span>
            </div>
          </div>
        )}
        <div className={isPending ? "pointer-events-none opacity-50" : ""}>
          <Calendar
            events={calendarEvents}
            onEventDrop={handleEventDrop}
            onEventClick={handleEventClick}
            validDropDates={validDropDates}
            className={isPending ? "blur-content" : ""}
          />
        </div>
      </div>
    </div>
  );
}
