import { TournamentWeek } from "@/db/types/tournamentWeek";
import { DateTime } from "luxon";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import Holidays from "date-holidays";

const holidays = new Holidays("DE", "HH", {
  types: ["public"],
});

type Props = {
  tournamentWeeks: TournamentWeek[];
};

export function TournamentWeeks({ tournamentWeeks }: Props) {
  const getSchedule = () => {
    let regularWeekCount = 0;
    let catchUpWeekCount = 0;

    return tournamentWeeks.map((week) => {
      const weekStart = DateTime.now()
        .set({ weekNumber: week.weekNumber })
        .startOf("week");

      const weekLabel =
        week.status === "regular"
          ? `Woche ${++regularWeekCount}`
          : `Nachholwoche ${++catchUpWeekCount}`;

      return {
        id: week.id,
        weekLabel,
        tuesday: weekStart.plus({ days: 1 }),
        thursday: weekStart.plus({ days: 3 }),
        friday: weekStart.plus({ days: 4 }),
      };
    });
  };

  const schedule = getSchedule();

  return (
    <Table className="w-full">
      <TableHeader>
        <TableRow>
          <TableHead className="w-[140px] min-w-[140px]">Woche</TableHead>
          <TableHead className="text-center">Dienstag</TableHead>
          <TableHead className="text-center">Donnerstag</TableHead>
          <TableHead className="text-center">Freitag</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {schedule.map((week) => (
          <TableRow key={week.id}>
            <TableCell className="font-semibold text-nowrap">
              {week.weekLabel}
            </TableCell>
            <TableCell className="text-center">
              {displayDate(week.tuesday)}
            </TableCell>
            <TableCell className="text-center">
              {displayDate(week.thursday)}
            </TableCell>
            <TableCell className="text-center">
              {displayDate(week.friday)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function displayDate(date: DateTime) {
  if (holidays.isHoliday(date.toJSDate())) {
    return "Feiertag";
  }
  return date.toFormat("dd.MM");
}
