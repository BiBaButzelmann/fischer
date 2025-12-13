export type HeaderSectionData = {
  tournamentName: string;
  numberOfPlayers: number;
  numberOfRounds: number;
  groupNumber: number;
};

export type Result = {
  pieceColor: "W" | "B";
  result: "1" | "0" | "R" | "+:" | "-:";
  opponentEndGroupPosition: number;
  round: number;
};

export type PlayerEntry = {
  endGroupPosition: number;
  startingGroupPosition: number;
  name: string;
  birthYear?: number;
  club: string;
  fideId?: string;
  zpsClubId?: string;
  zpsPlayerId?: string;
  results: Result[];
};

export type PlayerSectionData = PlayerEntry[];

export type TournamentSectionData = {
  tournamentName?: string;
  location?: string;
  fideFederation?: string;
  startDate: Date;
  endDate: Date;
  timeLimit?: string;
  tournamentOrganizer?: string;
  mainReferee?: string;
  otherReferees?: string;
};
