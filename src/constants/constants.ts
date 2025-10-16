import { DayOfWeek } from "@/db/types/group";

export const matchDays: Record<DayOfWeek, string> = {
  tuesday: "Dienstag",
  thursday: "Donnerstag",
  friday: "Freitag",
};

export const matchDaysShort: Record<DayOfWeek, string> = {
  tuesday: "Di",
  thursday: "Do",
  friday: "Fr",
};

export const DEFAULT_CLUB_KEY = "hsk";
export const DEFAULT_CLUB_LABEL = "Hamburger Schachklub von 1830 e.V.";

export const monthLabels = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

export const NUMBER_OF_GROUPS_WITH_ELO = 4;

export const CALENDAR_EXPORT_DURATIONS = {
  GAME: 5 * 60 * 60 * 1000,
  REFEREE: 5 * 60 * 60 * 1000,
  SETUP_HELPER: 30 * 60 * 1000,
} as const;

export const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
