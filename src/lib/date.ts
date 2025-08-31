import { DateTime } from "luxon";
import { isHoliday } from "./holidays";

/**
 * Gets the current time in Berlin timezone
 * @returns A Date object representing the current time in Berlin
 */
export function getBerlinTime(): Date {
  const berlinNow = new Date().toLocaleString("en-US", {
    timeZone: "Europe/Berlin",
  });
  return new Date(berlinNow);
}

/**
 * Converts any date to Berlin timezone
 * @param date - The date to convert
 * @returns A Date object representing the given date in Berlin timezone
 */
export function toBerlinTime(date: Date): Date {
  const berlinTime = date.toLocaleString("en-US", {
    timeZone: "Europe/Berlin",
  });
  return new Date(berlinTime);
}

/**
 * Gets a Luxon DateTime instance in Berlin timezone
 * @returns A DateTime object representing the current time in Berlin
 */
export function getBerlinDateTime(): DateTime {
  return DateTime.now().setZone("Europe/Berlin");
}

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

/**
 * Formats a date with weekday, long month, and year in German locale
 * @param date - The date to format
 * @returns A formatted date string like "Donnerstag, 15. August 2024"
 */
export function displayLongDate(date: Date): string {
  return date.toLocaleDateString("de-DE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Formats a date and time for display in event lists (e.g., "Mo 01.08 um 14:30")
 * @param date - The date to format
 * @returns Formatted date and time string
 */
export function formatEventDateTime(date: Date): string {
  const dateStr = formatSimpleDate(date);
  const timeStr = date.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dateStr} um ${timeStr}`;
}

/**
 * Formats a date in German format (dd.MM.yyyy)
 * @param date - The date to format
 * @returns Formatted date string
 */
export function formatSimpleDate(date: Date): string {
  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
