"use client";

import { Fragment, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  ACTIVITY_EVENT_LABELS,
  type ActivityEvent,
} from "@/lib/activity";
import { formatDateOnly, formatEventDateTime, toLocalDateTime } from "@/lib/date";
import { matchDays } from "@/constants/constants";
import { DayOfWeek } from "@/db/types/group";

const FIELD_LABELS: Record<string, string> = {
  chessClub: "Schachverein",
  title: "Titel",
  gender: "Geschlecht",
  dwzRating: "DWZ",
  fideRating: "Elo",
  fideId: "FIDE ID",
  nationality: "Nationalität",
  birthYear: "Geburtsjahr",
  birthDate: "Geburtsdatum",
  preferredMatchDay: "Bevorzugter Spieltag",
  secondaryMatchDays: "Ausweich-Spieltage",
  notAvailableDays: "Nicht verfügbare Tage",
  dsbPersonId: "DSB-Person",
  zpsClubId: "ZPS-Verein",
  zpsPlayerId: "ZPS-Spieler",
  entryFeePayed: "Startgeld bezahlt",
  exercisePromotionRight: "Aufstiegsrecht",
};

type Props = {
  events: ActivityEvent[];
};

export function ActivityTable({ events }: Props) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  if (events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Keine Aktivität im gewählten Zeitraum.
      </p>
    );
  }

  const toggleRow = (index: number) => {
    setExpandedRows((current) => {
      const next = new Set(current);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className="border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8" />
            <TableHead className="whitespace-nowrap">Zeitstempel</TableHead>
            <TableHead>Aktion</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event, index) => {
            const isExpandable =
              event.changes != null && Object.keys(event.changes).length > 0;
            const isExpanded = expandedRows.has(index);

            return (
              <Fragment key={`${event.type}-${event.timestamp.getTime()}-${index}`}>
                <TableRow
                  className={isExpandable ? "cursor-pointer" : undefined}
                  onClick={isExpandable ? () => toggleRow(index) : undefined}
                >
                  <TableCell className="w-8">
                    {isExpandable ? (
                      isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )
                    ) : null}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatEventDateTime(toLocalDateTime(event.timestamp))}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {ACTIVITY_EVENT_LABELS[event.type]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {event.path ??
                      (isExpandable
                        ? `${Object.keys(event.changes!).length} Feld${
                            Object.keys(event.changes!).length === 1 ? "" : "er"
                          } geändert`
                        : "–")}
                  </TableCell>
                </TableRow>
                {isExpandable && isExpanded ? (
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableCell />
                    <TableCell colSpan={3}>
                      <dl className="space-y-1 py-1 text-sm">
                        {Object.entries(event.changes!).map(([field, change]) => (
                          <div key={field} className="flex flex-wrap gap-x-2">
                            <dt className="font-medium">
                              {FIELD_LABELS[field] ?? field}:
                            </dt>
                            <dd className="text-muted-foreground">
                              {formatValue(field, change.old)} →{" "}
                              {formatValue(field, change.new)}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </TableCell>
                  </TableRow>
                ) : null}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function formatValue(field: string, value: unknown): string {
  if (value == null || (Array.isArray(value) && value.length === 0)) {
    return "–";
  }
  if (typeof value === "boolean") {
    return value ? "Ja" : "Nein";
  }
  if (field === "preferredMatchDay") {
    return matchDays[value as DayOfWeek] ?? String(value);
  }
  if (field === "secondaryMatchDays" && Array.isArray(value)) {
    return value
      .map((day) => matchDays[day as DayOfWeek] ?? String(day))
      .join(", ");
  }
  if (field === "notAvailableDays" && Array.isArray(value)) {
    return value.map((day) => formatDateOnly(String(day))).join(", ");
  }
  if (field === "birthDate") {
    return formatDateOnly(String(value));
  }
  if (field === "gender") {
    return value === "m" ? "Männlich" : "Weiblich";
  }
  return String(value);
}
