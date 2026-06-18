import invariant from "tiny-invariant";
import { Tournament } from "@/db/types/tournament";
import { toDateString, toLocalDateTime } from "./date";

export function getGroupAnnouncementDate(
  tournament: Pick<
    Tournament,
    "endRegistrationDate" | "groupAnnouncementOffsetDays"
  >,
): string {
  return toDateString(
    toLocalDateTime(tournament.endRegistrationDate).plus({
      days: tournament.groupAnnouncementOffsetDays,
    }),
  );
}

export function generateTournamentWeeksSchedule(
  tournamentWeeks: Array<{
    id: number;
    status: "regular" | "catch-up";
    matchdays: Array<{ date: Date }>;
  }>,
) {
  let regularWeekCount = 0;
  let catchUpWeekCount = 0;

  return tournamentWeeks.map((week) => {
    const weekLabel =
      week.status === "regular"
        ? `Woche ${++regularWeekCount}`
        : `Verlegungswoche ${++catchUpWeekCount}`;

    invariant(
      week.matchdays[0],
      `Tournament week ${week.id} has no matchdays`,
    );
    const weekStart = toLocalDateTime(week.matchdays[0].date).startOf("week");

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
  TMatchday extends { date: Date },
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

    invariant(
      entry.matchdays[0],
      `Tournament week ${week.weekNumber} has no matchdays`,
    );
    const weekStart = toLocalDateTime(entry.matchdays[0].date).startOf("week");

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
