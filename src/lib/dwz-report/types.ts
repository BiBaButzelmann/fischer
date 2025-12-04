export type HeaderSectionData = {
  tournamentName: string;
  numberOfPlayers: number;
  numberOfRounds: number;
  groupNumber: number;
};

export type Result = {
  pieceColor: "W" | "B";
  result: "1" | "0" | "R";
  opponentEndGroupPosition: number;
};

export type PlayerEntry = {
  endGroupPosition: number;
  startingGroupPosition: number;
  name: string;
  club: string;
  fideId?: string;
  zpsClubId?: string;
  zpsPlayerId?: string;
  results: Result[];
};

export type PlayerSectionData = PlayerEntry[];

export type TournamentSectionData = {
  name?: string;
  place?: string;
  fideFederation?: string;
  startDate: Date;
  endDate: Date;
  moves1?: string;
  moves2?: string;
  moves3?: string;
  tournamentOrganizer?: string;
  mainReferee?: string;
  otherReferees?: string;
  user: string;
};
