import { DateTime } from "luxon";

export type TournamentSectionData = {
  tournamentName: string;
  location: string;
  federation: string;
  startDate: DateTime;
  endDate: DateTime;
  numberOfPlayers: number;
  numberOfRatedPlayers: number;
  tournamentType: string;
  organizer: string;
  timeControl: string;
};

export type PlayerSectionData = PlayerEntry[];

export type PlayerEntry = {
  // ?
  index: number;
  startingGroupPosition: number;
  gender: "m" | "f";
  title: string;
  // firstName, lastName
  name: string;
  fideRating: number;
  fideNation: string;
  fideId: string;
  // yyyy/00/00
  birthYear: DateTime;
  // X.0
  currentPoints: number;
  currentGroupPosition: number;
  results: Result[];
};

export type Result = {
  scheduled: DateTime;
  opponentGroupPosition: number;
  pieceColor: "w" | "b";
  result: "1" | "0" | "+" | "-";
};

export type TableEntryKeyValue = {
  [K in keyof PlayerEntry]: { id: K; data: PlayerEntry[K] };
}[keyof PlayerEntry];
