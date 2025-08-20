"use client";

import {
  Calendar,
  Clock,
  Gamepad2,
  Gavel,
  LucideIcon,
  Wrench,
} from "lucide-react";
import { CalendarEvent } from "@/db/types/calendar";
import { formatEventDateTime } from "@/lib/date";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { buildGameViewUrl } from "@/lib/navigation";
import { match } from "ts-pattern";

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

type UpcomingRefereeEvent = {
  tournamentId: number;
  matchdayId: number;
  start: Date;
};
function UpcomingRefereeEvent({
  tournamentId,
  matchdayId,
  start,
}: UpcomingRefereeEvent) {
  const router = useRouter();

  const handleClick = () => {
    const url = buildGameViewUrl({
      tournamentId,
      matchdayId,
    });
    router.push(url);
  };

  return (
    <UpcomingEvent
      title="Schiedsrichter"
      start={start}
      onClick={handleClick}
      icon={
        <EventIcon
          icon={Gavel}
          backgroundColor="bg-red-100"
          iconColor="bg-red-600"
        />
      }
    />
  );
}

type UpcomingGameEvent = {
  tournamentId: number;
  groupId: number;
  round: number;
  participantId: number;
  start: Date;
};
function UpcomingGameEvent({
  tournamentId,
  groupId,
  round,
  participantId,
  start,
}: UpcomingGameEvent) {
  const router = useRouter();

  const handleClick = () => {
    const url = buildGameViewUrl({
      tournamentId,
      groupId,
      round,
      participantId,
    });
    router.push(url);
  };

  return (
    <UpcomingEvent
      title="Spiel"
      start={start}
      onClick={handleClick}
      icon={
        <EventIcon
          icon={Gamepad2}
          backgroundColor="bg-blue-100"
          iconColor="bg-blue-600"
        />
      }
    />
  );
}

type UpcomingSetupHelperEventProps = {
  tournamentId: number;
  matchdayId: number;
  start: Date;
};
function UpcomingSetupHelperEvent({
  tournamentId,
  matchdayId,
  start,
}: UpcomingSetupHelperEventProps) {
  const router = useRouter();

  const handleClick = () => {
    const url = buildGameViewUrl({
      tournamentId,
      matchdayId,
    });
    router.push(url);
  };

  return (
    <UpcomingEvent
      title="Setup-Helfer"
      start={start}
      onClick={handleClick}
      icon={
        <EventIcon
          icon={Wrench}
          backgroundColor="bg-green-100"
          iconColor="bg-green-600"
        />
      }
    />
  );
}

type UpcomingEventProps = {
  title: string;
  start: Date;
  onClick: () => void;
  icon: ReactNode;
};
function UpcomingEvent({ title, start, onClick, icon }: UpcomingEventProps) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 p-4 bg-white dark:bg-card border border-gray-200 dark:border-card-border rounded-xl shadow-sm transition-all hover:shadow-md cursor-pointer hover:opacity-80"
    >
      {icon}
      <div className="flex-grow">
        <p className="font-bold text-gray-800 dark:text-gray-100">{title}</p>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
          <Clock className="w-4 h-4" />
          <span>{formatEventDateTime(start)}</span>
        </div>
      </div>
    </div>
  );
}

type EventIconProps = {
  icon: LucideIcon;
  backgroundColor: string;
  iconColor: string;
};
function EventIcon({ icon: Icon, backgroundColor, iconColor }: EventIconProps) {
  return (
    <div className={`flex-shrink-0 p-3 rounded-full ${backgroundColor}`}>
      <Icon className={`w-6 h-6 ${iconColor}`} />
    </div>
  );
}
