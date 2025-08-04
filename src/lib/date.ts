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
