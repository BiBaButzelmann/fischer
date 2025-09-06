"use client";

import { Button } from "@/components/ui/button";
import { CalendarEvent } from "@/db/types/calendar";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { CALENDAR_EXPORT_DURATIONS } from "@/constants/constants";

type Props = {
  events: CalendarEvent[];
};

export function CalendarExport({ events }: Props) {
  const getEventDuration = (event: CalendarEvent): number => {
    switch (event.extendedProps.eventType) {
      case "game":
        return CALENDAR_EXPORT_DURATIONS.GAME;
      case "referee":
        return CALENDAR_EXPORT_DURATIONS.REFEREE;
      case "setupHelper":
        return CALENDAR_EXPORT_DURATIONS.SETUP_HELPER;
      default:
        return CALENDAR_EXPORT_DURATIONS.GAME;
    }
  };

  const escapeICalText = (text: string): string => {
    return text
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\r?\n/g, "\\n");
  };

  const generateICalString = (events: CalendarEvent[]): string => {
    const icalHeader = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Klubturnier//Calendar Export//DE",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
    ].join("\r\n");

    const icalFooter = "END:VCALENDAR";

    const icalEvents = events
      .map((event) => {
        const startDate = new Date(event.start);
        const endDate = new Date(startDate.getTime() + getEventDuration(event));

        const formatDate = (date: Date) => {
          return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
        };

        const uid = `${event.id}-${startDate.getTime()}@klubturnier.hsk1830.de`;
        const summary = escapeICalText(event.title);
        const description = escapeICalText(getEventDescription(event));
        const dtstart = formatDate(startDate);
        const dtend = formatDate(endDate);
        const dtstamp = formatDate(new Date());

        return [
          "BEGIN:VEVENT",
          `UID:${uid}`,
          `DTSTART:${dtstart}`,
          `DTEND:${dtend}`,
          `DTSTAMP:${dtstamp}`,
          `SUMMARY:${summary}`,
          `DESCRIPTION:${description}`,
          "STATUS:CONFIRMED",
          "TRANSP:OPAQUE",
          "END:VEVENT",
        ].join("\r\n");
      })
      .join("\r\n");

    return [icalHeader, icalEvents, icalFooter].join("\r\n");
  };

  const getEventDescription = (event: CalendarEvent): string => {
    switch (event.extendedProps.eventType) {
      case "game":
        return `Schachspiel - Runde ${event.extendedProps.round}`;
      case "referee":
        return "Schiedsrichtertätigkeit";
      case "setupHelper":
        return "Aufbauhilfe";
      default:
        return "Klubturnier Termin";
    }
  };

  const downloadICalFile = () => {
    try {
      const icalString = generateICalString(events);
      const blob = new Blob([icalString], {
        type: "text/calendar;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "klubturnier-calendar.ics";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Kalenderdatei wurde heruntergeladen.");
    } catch {
      toast.error("Fehler beim Erstellen der Kalenderdatei.");
    }
  };

  if (events.length === 0) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
      onClick={downloadICalFile}
    >
      <Download className="h-4 w-4" />
      Kalender exportieren (.ics)
    </Button>
  );
}
