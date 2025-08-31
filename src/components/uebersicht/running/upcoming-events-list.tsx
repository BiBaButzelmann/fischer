"use client";

import { Calendar } from "lucide-react";
import { CalendarEvent } from "@/db/types/calendar";
import { match } from "ts-pattern";
import { UpcomingRefereeEvent } from "./upcoming-referee-event";
import { UpcomingGameEvent } from "./upcoming-game-event";
import { UpcomingSetupHelperEvent } from "./upcoming-setup-helper-event";

type Props = {
  events: CalendarEvent[];
};

export function UpcomingEventsList({ events }: Props) {
  return (
    <>
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" /> Deine nächsten Termine
      </div>
      {events.length > 0 ? (
        <div className="space-y-4">
          {events.map((event, index) =>
            match(event.extendedProps)
              .with({ eventType: "referee" }, (data) => (
                <UpcomingRefereeEvent
                  key={index}
                  start={event.start}
                  tournamentId={data.tournamentId}
                  matchdayId={data.matchdayId}
                />
              ))
              .with({ eventType: "game" }, (data) => (
                <UpcomingGameEvent
                  key={index}
                  start={event.start}
                  tournamentId={data.tournamentId}
                  groupId={data.groupId}
                  round={data.round}
                  participantId={data.participantId}
                />
              ))
              .with({ eventType: "setupHelper" }, (data) => (
                <UpcomingSetupHelperEvent
                  key={index}
                  start={event.start}
                  tournamentId={data.tournamentId}
                  matchdayId={data.matchdayId}
                />
              ))
              .exhaustive(),
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Keine anstehenden Termine</p>
        </div>
      )}
    </>
  );
}
