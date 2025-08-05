import { DateTime } from "luxon";

/**
 * Base schedule generation for tournament weeks
 * Calculates the weekdays (Tuesday, Thursday, Friday) for given weeks
 * and creates appropriate week labels based on status
 */
export function generateWeekScheduleBase<T>(
  weeks: Array<{ weekNumber: number; status: "regular" | "catch-up" }>,
  processor: (
    week: (typeof weeks)[0],
    weekIndex: number,
    weekDays: {
      tuesday: DateTime;
      thursday: DateTime;
      friday: DateTime;
    },
    weekLabel: string,
  ) => T,
): T[] {
  let regularWeekCount = 0;
  let catchUpWeekCount = 0;

  return weeks.map((week, index) => {
    const weekLabel =
      week.status === "regular"
        ? `Woche ${++regularWeekCount}`
        : `Verlegungswoche ${++catchUpWeekCount}`;

    const weekStart = DateTime.now()
      .set({ weekNumber: week.weekNumber })
      .startOf("week");

    const weekDays = {
      tuesday: weekStart.plus({ days: 1 }),
      thursday: weekStart.plus({ days: 3 }),
      friday: weekStart.plus({ days: 4 }),
    };

    return processor(week, index, weekDays, weekLabel);
  });
}

/**
 * Generates schedule for simple tournament weeks display
 */
export function generateTournamentWeeksSchedule(
  tournamentWeeks: Array<{
    id: number;
    weekNumber: number;
    status: "regular" | "catch-up";
  }>,
) {
  return generateWeekScheduleBase(
    tournamentWeeks,
    (_, index, weekDays, weekLabel) => ({
      id: tournamentWeeks[index].id,
      weekLabel,
      tuesday: weekDays.tuesday,
      thursday: weekDays.thursday,
      friday: weekDays.friday,
    }),
  );
}

/**
 * Generates schedule for referee assignment with matchday mapping
 */
export function generateRefereeAssignmentSchedule<
  TMatchday,
  TWeek extends { weekNumber: number; status: "regular" | "catch-up" },
>(
  groupedMatchdays: Record<
    number,
    {
      week: TWeek;
      matchdays: TMatchday[];
    }
  >,
  findMatchday: (
    matchdays: TMatchday[],
    dayOfWeek: "tuesday" | "thursday" | "friday",
  ) => TMatchday | undefined,
) {
  const entries = Object.values(groupedMatchdays);

  return generateWeekScheduleBase(
    entries.map((entry) => entry.week),
    (_, index, weekDays, weekLabel) => {
      const entry = entries[index];
      return {
        weekLabel,
        week: entry.week,
        tuesday: {
          date: weekDays.tuesday,
          matchday: findMatchday(entry.matchdays, "tuesday"),
        },
        thursday: {
          date: weekDays.thursday,
          matchday: findMatchday(entry.matchdays, "thursday"),
        },
        friday: {
          date: weekDays.friday,
          matchday: findMatchday(entry.matchdays, "friday"),
        },
      };
    },
  );
}
