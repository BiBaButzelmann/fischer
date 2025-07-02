"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import type { EventContentArg, EventInput } from "@fullcalendar/core/index.js";
import deLocale from "@fullcalendar/core/locales/de.js";
import interactionPlugin from "@fullcalendar/interaction";
import { useRouter } from "next/navigation";

export function Calendar({ events }: { events: EventInput[] }) {
  const router = useRouter();

  return (
    <FullCalendar
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      weekends={false}
      events={events}
      eventContent={renderEventContent}
      locales={[deLocale]}
      locale="de"
      editable
      eventStartEditable
      selectable
      eventDrop={console.log}
    />
  );
}

function renderEventContent(eventInfo: EventContentArg) {
  return (
    <div className="flex flex-wrap">
      <b>{eventInfo.timeText}</b>
      <span className="text-wrap">{eventInfo.event.title}</span>
    </div>
  );
}
