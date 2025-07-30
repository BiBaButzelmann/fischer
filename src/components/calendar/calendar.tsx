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
import { GameEvent } from "./game-event";
import { cn } from "@/lib/utils";

type Props = {
  events: EventInput[];
  onEventDrop?: (event: EventDropArg) => Promise<void>;
  onEventClick?: (event: EventClickArg) => void;
  className?: string;
};

export function Calendar({
  events,
  onEventDrop,
  onEventClick,
  className,
}: Props) {
  return (
    <div className={cn("calendar-container", className)}>
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
        eventDrop={onEventDrop}
        eventClick={onEventClick}
        height="auto"
        eventClassNames="cursor-pointer hover:opacity-80"
      />
    </div>
  );
}

function renderEventContent(eventInfo: EventContentArg) {
  return <GameEvent eventInfo={eventInfo} />;
}
