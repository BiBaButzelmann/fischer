"use client";

import { Calendar, Clock, Gamepad2, Gavel } from "lucide-react";
import { CalendarEvent } from "@/db/types/calendar";
import { formatEventDateTime } from "@/lib/date";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { buildGameViewUrl } from "@/lib/navigation";
import { toast } from "sonner";

type Props = {
  events: CalendarEvent[];
};

const eventConfig = {
  game: {
    icon: Gamepad2,
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  referee: {
    icon: Gavel,
    bgColor: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-600 dark:text-red-400",
  },
};

export function UpcomingEvents({ events }: Props) {
  const router = useRouter();

  const handleEventClick = useCallback(
    (event: CalendarEvent) => {
      if (event.extendedProps.eventType === "referee") {
        const tournamentId = event.extendedProps.tournamentId;
        const matchdayId = event.extendedProps.matchdayId;

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

      const gameId = event.extendedProps.gameId;
      const participantId = event.extendedProps.participantId;
      const round = event.extendedProps.round;
      const tournamentId = event.extendedProps.tournamentId;
      const groupId = event.extendedProps.groupId;

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

  const getEventDisplayData = useCallback((event: CalendarEvent) => {
    const eventType = event.extendedProps.eventType;
    const displayType = eventType === "game" ? "Spiel" : "Schiedsrichter";
    return {
      displayType,
      title: event.title,
      time: formatEventDateTime(event.start),
      eventType,
    };
  }, []);

  return (
    <>
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" /> Deine nächsten Termine
      </div>
      {events.length > 0 ? (
        <div className="space-y-4">
          {events.map((event, index) => {
            const displayData = getEventDisplayData(event);
            const config =
              eventConfig[displayData.eventType as keyof typeof eventConfig];
            const Icon = config.icon;
            return (
              <div
                key={index}
                onClick={() => handleEventClick(event)}
                className="flex items-center gap-4 p-4 bg-white dark:bg-card border border-gray-200 dark:border-card-border rounded-xl shadow-sm transition-all hover:shadow-md cursor-pointer hover:opacity-80"
              >
                <div
                  className={`flex-shrink-0 p-3 rounded-full ${config.bgColor}`}
                >
                  <Icon className={`w-6 h-6 ${config.iconColor}`} />
                </div>
                <div className="flex-grow">
                  <p className="font-bold text-gray-800 dark:text-gray-100">
                    {displayData.displayType === "Schiedsrichter" &&
                    displayData.title === "Schiedsrichter"
                      ? "Schiedsrichter"
                      : `${displayData.title}`}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <Clock className="w-4 h-4" />
                    <span>{displayData.time}</span>
                  </div>
                </div>
              </div>
            );
          })}
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
