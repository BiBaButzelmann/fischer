export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  extendedProps: {
    gameId: number;
    participantId: number;
    isWhite: boolean;
    opponentName: string;
    round: number;
    boardNumber: number;
    color: "white" | "black";
  };
};
