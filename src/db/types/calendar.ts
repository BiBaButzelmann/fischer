import { DateTime } from "luxon";

type GameEvent = {
  id: string;
  title: string;
  start: DateTime;
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
  start: DateTime;
  extendedProps: {
    eventType: "referee";
    refereeId: number;
    matchdayId: number;
    tournamentId: number;
  };
};

type SetupHelperEvent = {
  id: string;
  title: string;
  start: DateTime;
  extendedProps: {
    eventType: "setupHelper";
    setupHelperId: number;
    matchdayId: number;
    tournamentId: number;
  };
};

export type CalendarEvent = GameEvent | RefereeEvent | SetupHelperEvent;
