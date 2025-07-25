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
