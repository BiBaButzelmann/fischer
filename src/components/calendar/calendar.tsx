"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import type {
  EventContentArg,
  EventInput,
  EventDropArg,
  EventClickArg,
  DayCellMountArg,
  DatesSetArg,
  AllowFunc,
} from "@fullcalendar/core/index.js";
import type { DateClickArg } from "@fullcalendar/interaction/index.js";
import deLocale from "@fullcalendar/core/locales/de.js";
import interactionPlugin from "@fullcalendar/interaction";
import { GameEvent } from "./game-event";
import { cn } from "@/lib/utils";

type Props = {
  events: EventInput[];
  onEventDrop?: (event: EventDropArg) => Promise<void>;
  onEventClick?: (event: EventClickArg) => void;
  className?: string;
  onEventDragStart?: () => void;
  onEventDragStop?: () => void;
  onDayCellDidMount?: (info: DayCellMountArg) => void;
  eventAllow?: AllowFunc;
  initialDate?: Date;
  onDatesSet?: (info: DatesSetArg) => void;
  onDateClick?: (info: DateClickArg) => void;
};

export function Calendar({
  events,
  onEventDrop,
  onEventClick,
  className,
  onEventDragStart,
  onEventDragStop,
  onDayCellDidMount,
  eventAllow,
  initialDate,
  onDatesSet,
  onDateClick,
}: Props) {
  return (
    <div className={cn("calendar-container", className)}>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        initialDate={initialDate}
        weekends={false}
        events={events}
        eventContent={renderEventContent}
        locales={[deLocale]}
        locale="de"
        editable={true}
        eventStartEditable={true}
        selectOverlap={true}
        eventOverlap={true}
        selectable={false}
        eventDrop={onEventDrop}
        eventClick={onEventClick}
        dateClick={onDateClick}
        height="auto"
        eventClassNames="cursor-pointer hover:opacity-80"
        eventAllow={eventAllow}
        dayCellDidMount={onDayCellDidMount}
        datesSet={onDatesSet}
        eventDragStart={onEventDragStart}
        eventDragStop={onEventDragStop}
      />
    </div>
  );
}

function renderEventContent(eventInfo: EventContentArg) {
  return <GameEvent eventInfo={eventInfo} />;
}
