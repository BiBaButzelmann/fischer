type GameEvent = {
  id: string;
  title: string;
  start: Date;
  extendedProps: {
    eventType: "game";
    gameId: number;
    participantId: number;
    round: number;
    tournamentId: number;
    groupId: number;
  };
};

type RefereeEvent = {
  id: string;
  title: string;
  start: Date;
  extendedProps: {
    eventType: "referee";
    refereeId: number;
    matchdayId: number;
    tournamentId: number;
  };
};

export type CalendarEvent = GameEvent | RefereeEvent;

export function isGameEvent(event: CalendarEvent): event is GameEvent {
  return event.extendedProps.eventType === "game";
}

export function isRefereeEvent(event: CalendarEvent): event is RefereeEvent {
  return event.extendedProps.eventType === "referee";
}
