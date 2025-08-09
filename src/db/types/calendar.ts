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

type SetupHelperEvent = {
  id: string;
  title: string;
  start: Date;
  extendedProps: {
    eventType: "setupHelper";
    setupHelperId: number;
    matchdayId: number;
    tournamentId: number;
  };
};

export type CalendarEvent = GameEvent | RefereeEvent | SetupHelperEvent;
