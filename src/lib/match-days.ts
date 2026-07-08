import { DayOfWeek } from "@/db/types/group";

export function hasSecondaryMatchDayConflict(
  preferredMatchDay: DayOfWeek,
  secondaryMatchDays: DayOfWeek[],
): boolean {
  return secondaryMatchDays.includes(preferredMatchDay);
}

export function removePreferredFromSecondary(
  preferredMatchDay: DayOfWeek,
  secondaryMatchDays: DayOfWeek[],
): DayOfWeek[] {
  return secondaryMatchDays.filter((day) => day !== preferredMatchDay);
}
