"use client";

import { Calendar } from ".";
import {
  type EventInput,
  type EventDropArg,
  type EventClickArg,
  type DayCellMountArg,
  type AllowFunc,
} from "@fullcalendar/core/index.js";
import { CalendarEvent } from "@/db/types/calendar";
import { useTransition, useCallback } from "react";
import { updateGameMatchdayAndBoardNumber } from "@/actions/game";
import { MatchDay } from "@/db/types/match-day";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { buildGameViewUrl } from "@/lib/navigation";
import { isSameDate } from "@/lib/date";

type Props = {
  events: CalendarEvent[];
  matchdays: MatchDay[];
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

  const initialDate =
    validDropDates.length > 0 ? validDropDates[0] : new Date();

  const handleEventDrop = useCallback(
    async (info: EventDropArg) => {
      if (!info.event.start) {
        info.revert();
        return;
      }

      if (info.event.extendedProps.eventType === "referee") {
        info.revert();
        toast.error("Schiedsrichter-Termine können nicht verschoben werden.");
        return;
      }

      if (info.event.extendedProps.eventType === "setupHelper") {
        info.revert();
        toast.error("Aufbauhelfer-Termine können nicht verschoben werden.");
        return;
      }

      const gameId = info.event.extendedProps.gameId;
      if (!gameId) {
        info.revert();
        return;
      }

      const newDate = info.event.start;
      const isValidDate = validDropDates.some((validDate) =>
        isSameDate(validDate, newDate),
      );
      if (!isValidDate) {
        info.revert();
        return;
      }

      const targetMatchday = matchdays.find((matchday) =>
        isSameDate(matchday.date, newDate),
      ) as MatchDay;

      startTransition(async () => {
        try {
          await updateGameMatchdayAndBoardNumber(gameId, targetMatchday.id);
          toast.success("Spiel erfolgreich verschoben!");
        } catch {
          toast.error("Fehler beim Verschieben des Spiels.");
          info.revert();
        }
      });
    },
    [matchdays, validDropDates],
  );

  const handleEventClick = useCallback(
    (info: EventClickArg) => {
      if (info.event.extendedProps.eventType === "referee") {
        const tournamentId = info.event.extendedProps.tournamentId;
        const matchdayId = info.event.extendedProps.matchdayId;

        if (!tournamentId || !matchdayId) {
          toast.error("Fehler: Turnier oder Spieltag nicht gefunden.");
          return;
        }

        const url = buildGameViewUrl({
          tournamentId,
          matchdayId,
        });

        router.push(url);
        return;
      }

      if (info.event.extendedProps.eventType === "setupHelper") {
        const tournamentId = info.event.extendedProps.tournamentId;
        const matchdayId = info.event.extendedProps.matchdayId;

        if (!tournamentId || !matchdayId) {
          toast.error("Fehler: Turnier oder Spieltag nicht gefunden.");
          return;
        }

        const url = buildGameViewUrl({
          tournamentId,
          matchdayId,
        });

        router.push(url);
        return;
      }

      const gameId = info.event.extendedProps.gameId;
      const participantId = info.event.extendedProps.participantId;
      const round = info.event.extendedProps.round;
      const tournamentId = info.event.extendedProps.tournamentId;
      const groupId = info.event.extendedProps.groupId;

      if (!gameId || !participantId || !round || !tournamentId || !groupId) {
        return;
      }

      const url = buildGameViewUrl({
        tournamentId,
        groupId,
        round,
        participantId,
      });

      router.push(url);
    },
    [router],
  );

  const handleEventAllow: AllowFunc = useCallback(
    (dropInfo) => {
      if (validDropDates.length === 0) return true;

      const dropDate = new Date(dropInfo.start);
      return validDropDates.some((validDate: Date) =>
        isSameDate(validDate, dropDate),
      );
    },
    [validDropDates],
  );

  const handleDayCellDidMount = useCallback(
    (info: DayCellMountArg) => {
      if (validDropDates.length === 0) return;

      const cellDate = new Date(info.date);
      const isValidDropDate = validDropDates.some((validDate: Date) =>
        isSameDate(validDate, cellDate),
      );

      if (isValidDropDate) {
        info.el.classList.add("drop-zone-valid");
      }
    },
    [validDropDates],
  );

  const handleEventDragStart = useCallback(() => {
    document.body.classList.add("calendar-dragging");
  }, []);

  const handleEventDragStop = useCallback(() => {
    document.body.classList.remove("calendar-dragging");
  }, []);

  const handleDatesSet = useCallback(() => {
    setTimeout(() => {
      const dayCells = document.querySelectorAll(".fc-daygrid-day");

      dayCells.forEach((cell: Element) => {
        const htmlElement = cell as HTMLElement;
        const dateStr = htmlElement.getAttribute("data-date");
        if (dateStr) {
          const cellDate = new Date(dateStr);
          const isValidDropDate = validDropDates.some((validDate: Date) =>
            isSameDate(validDate, cellDate),
          );

          if (isValidDropDate) {
            htmlElement.classList.add("drop-zone-valid");
          } else {
            htmlElement.classList.remove("drop-zone-valid");
          }
        }
      });
    }, 0);
  }, [validDropDates]);

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
            eventAllow={handleEventAllow}
            onDayCellDidMount={handleDayCellDidMount}
            onEventDragStart={handleEventDragStart}
            onEventDragStop={handleEventDragStop}
            onDatesSet={handleDatesSet}
            initialDate={initialDate}
            className={isPending ? "blur-content" : ""}
          />
        </div>
      </div>
    </div>
  );
}
