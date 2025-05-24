"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import type { EventContentArg, EventInput } from "@fullcalendar/core/index.js";
import deLocale from "@fullcalendar/core/locales/de.js";
import interactionPlugin from "@fullcalendar/interaction";
import { useRouter } from "next/navigation";

const events: EventInput[] = [
    { title: "Meeting", start: new Date(2025, 4, 20, 20, 0) },
    { title: "Meeting", start: new Date(2025, 4, 17, 20, 0) },
    { title: "Meeting", start: new Date(2025, 4, 5, 20, 0) },
];

export function Calendar() {
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
            eventClick={() => {
                router.push("/events/1");
            }}
        />
    );
}

function renderEventContent(eventInfo: EventContentArg) {
    return (
        <>
            <b>{eventInfo.timeText}</b>
            <i>{eventInfo.event.title}</i>
        </>
    );
}
