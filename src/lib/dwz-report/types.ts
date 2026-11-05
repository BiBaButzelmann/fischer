import type { GameResult } from "@/db/types/game";

/**
 * Input model for the DWZ report mapper. These are the raw tournament data
 * from the database; the shared TRF output model lives in
 * `@/lib/fide-report/types`.
 */
export type DwzReportParticipant = {
  id: number;
  startingPosition: number;
  firstName: string;
  lastName: string;
  academicTitle?: string | null;
  title?: string | null;
  gender?: "m" | "f" | null;
  birthYear?: number | null;
  birthDate?: string | null;
  nationality?: string | null;
  fideId?: string | null;
  fideRating?: number | null;
  dwzRating?: number | null;
};

export type DwzReportGame = {
  round: number;
  whiteParticipantId: number;
  blackParticipantId: number;
  result: GameResult | null;
  // YYYY-MM-DD
  date: string;
};

export type DwzReportStanding = {
  participantId: number;
  points: number;
};

export type DwzReportInput = {
  tournamentName: string;
  groupName: string;
  location: string;
  startDate: string;
  endDate: string;
  timeLimit: string;
  referee?: string;
  participants: DwzReportParticipant[];
  // All games of the group, including games without a result yet.
  games: DwzReportGame[];
  standings: DwzReportStanding[];
};
