"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CalendarEvent } from "@/db/types/calendar";
import { Download, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";

type Props = {
  events: CalendarEvent[];
};

export function CalendarExport({ events }: Props) {
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
        const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours duration

        const formatDate = (date: Date) => {
          return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
        };

        const uid = `${event.id}-${startDate.getTime()}@klubturnier.com`;
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

      toast.success("Kalenderdatei wurde heruntergeladen!");
    } catch (error) {
      console.error("Error generating calendar file:", error);
      toast.error("Fehler beim Erstellen der Kalenderdatei.");
    }
  };

  const exportToGoogleCalendar = () => {
    try {
      const baseUrl =
        "https://calendar.google.com/calendar/render?action=TEMPLATE";

      if (events.length === 1) {
        const event = events[0];
        const startDate = new Date(event.start);
        const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

        const formatGoogleDate = (date: Date) => {
          return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
        };

        const params = new URLSearchParams({
          text: event.title,
          dates: `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`,
          details: getEventDescription(event),
          ctz: "Europe/Berlin",
        });

        window.open(`${baseUrl}&${params.toString()}`, "_blank");
      } else {
        downloadICalFile();
        toast.info(
          "Nutzen Sie die heruntergeladene .ics Datei, um alle Termine zu Google Calendar hinzuzufügen.",
        );
      }
    } catch (error) {
      console.error("Error exporting to Google Calendar:", error);
      toast.error("Fehler beim Export zu Google Calendar.");
    }
  };

  const exportToAppleCalendar = () => {
    try {
      downloadICalFile();
      toast.info(
        "Öffnen Sie die heruntergeladene .ics Datei, um die Termine zu Apple Calendar hinzuzufügen.",
      );
    } catch (error) {
      console.error("Error exporting to Apple Calendar:", error);
      toast.error("Fehler beim Export zu Apple Calendar.");
    }
  };

  if (events.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Kalender exportieren
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={exportToGoogleCalendar} className="gap-2">
          <CalendarIcon className="h-4 w-4" />
          Zu Google Calendar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToAppleCalendar} className="gap-2">
          <CalendarIcon className="h-4 w-4" />
          Zu Apple Calendar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={downloadICalFile} className="gap-2">
          <Download className="h-4 w-4" />
          Als .ics Datei herunterladen
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
