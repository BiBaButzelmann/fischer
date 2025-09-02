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

export const GAME_START_TIME = {
  hours: 19,
  minutes: 0,
  seconds: 0,
} as const;

export const NUMBER_OF_GROUPS_WITH_ELO = 4;

export const PLAYED_GAME_RESULTS = ["1:0", "0:1", "½-½", "0-½", "½-0"] as const;
