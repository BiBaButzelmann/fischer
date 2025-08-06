import { DateTime } from "luxon";
import { isHoliday } from "./holidays";

export function getDatetimeString(date: Date) {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };
  return date.toLocaleString("de-DE", options).replace(",", "");
}

/**
 * Compares two dates to check if they are the same day (ignoring time)
 * @param date1 - First date to compare
 * @param date2 - Second date to compare
 * @returns True if the dates represent the same day, false otherwise
 */
export function isSameDate(date1: Date, date2: Date): boolean {
  return date1.toDateString() === date2.toDateString();
}

/**
 * Displays a date in dd.MM format, or "Feiertag" if it's a holiday
 * @param date - The DateTime object to format
 * @returns Formatted date string or "Feiertag"
 */
export function displayShortDateOrHoliday(date: DateTime): string {
  if (isHoliday(date.toJSDate())) {
    return "Feiertag";
  }
  return date.toFormat("dd.MM");
}
