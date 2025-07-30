"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import type {
  EventContentArg,
  EventInput,
  EventDropArg,
  EventClickArg,
} from "@fullcalendar/core/index.js";
import deLocale from "@fullcalendar/core/locales/de.js";
import interactionPlugin from "@fullcalendar/interaction";
import { useCallback, useState } from "react";
import { GameEvent } from "./game-event";
import { toast } from "sonner";

type Props = {
  events: EventInput[];
  onEventDrop?: (gameId: number, newDate: Date) => Promise<void>;
  onEventClick?: (gameId: number, participantId: number, round: number) => void;
  validDropDates?: Date[];
  className?: string;
};

export function Calendar({
  events,
  onEventDrop,
  onEventClick,
  validDropDates = [],
  className = "",
}: Props) {
  const [isDragging, setIsDragging] = useState(false);

  const handleEventDrop = useCallback(
    async (info: EventDropArg) => {
      setIsDragging(false);
      if (!onEventDrop) {
        info.revert();
        return;
      }

      const gameId = info.event.extendedProps.gameId;
      const newDate = info.event.start;

      if (!newDate || !gameId) {
        info.revert();
        return;
      }

      const isValidDate = validDropDates.some(
        (validDate) => validDate.toDateString() === newDate.toDateString(),
      );

      if (!isValidDate) {
        info.revert();
        return;
      }

      try {
        await onEventDrop(gameId, newDate);
      } catch {
        toast.error("Fehler beim Verschieben des Spiels.");
        info.revert();
      }
    },
    [onEventDrop, validDropDates],
  );

  const handleEventDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleEventDragStop = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleEventClick = useCallback(
    (info: EventClickArg) => {
      if (!onEventClick) {
        return;
      }

      const gameId = info.event.extendedProps.gameId;
      const participantId = info.event.extendedProps.participantId;
      const round = info.event.extendedProps.round;

      if (gameId && participantId && round) {
        onEventClick(gameId, participantId, round);
      }
    },
    [onEventClick],
  );

  const dayClassNames = useCallback(
    (arg: { date: Date }) => {
      const isValidDropDate = validDropDates.some(
        (validDate) => validDate.toDateString() === arg.date.toDateString(),
      );

      if (isValidDropDate && isDragging) {
        return ["drop-zone-valid"];
      }

      return [];
    },
    [validDropDates, isDragging],
  );

  return (
    <div className={`calendar-container ${className}`}>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        weekends={false}
        events={events}
        eventContent={renderEventContent}
        locales={[deLocale]}
        locale="de"
        editable={true}
        eventStartEditable={true}
        selectable={false}
        eventDrop={handleEventDrop}
        eventDragStart={handleEventDragStart}
        eventDragStop={handleEventDragStop}
        eventClick={handleEventClick}
        dayCellClassNames={dayClassNames}
        height="auto"
        eventClassNames="cursor-pointer hover:opacity-80"
      />
    </div>
  );
}

function renderEventContent(eventInfo: EventContentArg) {
  return <GameEvent eventInfo={eventInfo} />;
}
