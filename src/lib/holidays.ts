import Holidays from "date-holidays";

export const holidays = new Holidays("DE", "HH", {
  types: ["public"],
});

export function isHoliday(date: Date): boolean {
  const result = holidays.isHoliday(date);
  return result !== false;
}
