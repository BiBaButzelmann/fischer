import { DateTime } from "luxon";
import { isHoliday } from "./holidays";

export function getCurrentLocalDateTime(): DateTime {
  return DateTime.now().setZone("Europe/Berlin");
}

export function toLocalDateTime(date: Date): DateTime {
  return DateTime.fromJSDate(date).setZone("Europe/Berlin");
}

export function getDatetimeString(date: DateTime) {
  return date.toFormat("dd.MM.yyyy HH:mm");
}

export function isSameDate(date1: DateTime, date2: DateTime): boolean {
  return date1.equals(date2);
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

/**
 * Formats a game date for display in German locale (DD.MM.YYYY format)
 * @param date - The game date/time to format
 * @returns A formatted date string in German format
 */
export function toDateString(date: DateTime): string {
  return date.toFormat("dd.MM.yyyy");
}
