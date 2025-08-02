export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  extendedProps: {
    gameId: number;
    participantId: number;
    round: number;
    tournamentId: number;
    groupId: number;
  };
};
