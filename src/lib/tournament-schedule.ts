import { DateTime } from "luxon";
import { getBerlinDateTime } from "./date";

export function generateTournamentWeeksSchedule(
  tournamentWeeks: Array<{
    id: number;
    weekNumber: number;
    status: "regular" | "catch-up";
  }>,
) {
  let regularWeekCount = 0;
  let catchUpWeekCount = 0;

  return tournamentWeeks.map((week) => {
    const weekLabel =
      week.status === "regular"
        ? `Woche ${++regularWeekCount}`
        : `Verlegungswoche ${++catchUpWeekCount}`;

    const weekStart = getBerlinDateTime()
      .set({ weekNumber: week.weekNumber })
      .startOf("week");

    return {
      id: week.id,
      weekLabel,
      tuesday: weekStart.plus({ days: 1 }),
      thursday: weekStart.plus({ days: 3 }),
      friday: weekStart.plus({ days: 4 }),
    };
  });
}

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
  let regularWeekCount = 0;
  let catchUpWeekCount = 0;

  return entries.map((entry) => {
    const week = entry.week;
    const weekLabel =
      week.status === "regular"
        ? `Woche ${++regularWeekCount}`
        : `Verlegungswoche ${++catchUpWeekCount}`;

    const weekStart = DateTime.now()
      .set({ weekNumber: week.weekNumber })
      .startOf("week");

    const tuesday = weekStart.plus({ days: 1 });
    const thursday = weekStart.plus({ days: 3 });
    const friday = weekStart.plus({ days: 4 });

    return {
      weekLabel,
      week: entry.week,
      tuesday: {
        date: tuesday,
        matchday: findMatchday(entry.matchdays, "tuesday"),
      },
      thursday: {
        date: thursday,
        matchday: findMatchday(entry.matchdays, "thursday"),
      },
      friday: {
        date: friday,
        matchday: findMatchday(entry.matchdays, "friday"),
      },
    };
  });
}
