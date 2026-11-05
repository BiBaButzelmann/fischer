import type { GameResult } from "@/db/types/game";
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
  referee: string;
  timeLimit: string;
  /**
   * When set, the player section uses one column per round and line 132
   * contains the date of each round. Otherwise the columns are derived from
   * the scheduled dates of the games (used by the monthly FIDE report).
   */
  roundDates?: Array<DateTime | undefined>;
};

export type PlayerSectionData = PlayerEntry[];

export type PlayerEntry = {
  startingPosition: number;
  // Domain value; the TRF writer maps "f" to "w".
  gender?: "m" | "f";
  title?: string;
  // LastName,FirstName[,AcademicTitle]
  name: string;
  fideRating?: number;
  fideNation?: string;
  fideId?: string;
  // YYYY/MM/DD, month and day may be 00 when only the year is known
  birthDate?: string;
  points: number;
  rank: number;
  results: Result[];
};

export type Result =
  | {
      // Used when the report is rendered with one column per round.
      round?: number;
      // Used when the report is rendered with one column per game date.
      scheduled?: DateTime;
      opponentStartingPosition: number;
      pieceColor: "w" | "b";
      result: GameResult;
    }
  | {
      round?: number;
      scheduled?: DateTime;
      opponentStartingPosition: null;
      pieceColor: null;
      // TRF bye codes; "+" and "-" cover forfeits against an undefined opponent.
      result: "U" | "Z" | "H" | "F" | "+" | "-";
    };
