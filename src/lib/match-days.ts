import { DayOfWeek } from "@/db/types/group";
import { matchDaysShort } from "@/constants/constants";

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

export function formatMatchDays(
  preferredMatchDay: DayOfWeek,
  secondaryMatchDays: DayOfWeek[],
): string {
  const secondary = removePreferredFromSecondary(
    preferredMatchDay,
    secondaryMatchDays,
  ).map((day) => matchDaysShort[day]);

  return secondary.length > 0
    ? `Bevorzugt ${matchDaysShort[preferredMatchDay]} · auch ${secondary.join(", ")}`
    : `Nur ${matchDaysShort[preferredMatchDay]}`;
}
