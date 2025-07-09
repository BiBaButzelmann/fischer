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

type Props = {
  tournamentWeeks: TournamentWeek[];
};

export function TournamentWeeks({ tournamentWeeks }: Props) {
  const schedule = tournamentWeeks.map((week) => {
    const weekStart = DateTime.now()
      .set({ weekNumber: week.weekNumber })
      .startOf("week");
    return {
      id: week.id,
      status: week.status,
      tuesday: weekStart.plus({ days: 1 }).toFormat("dd.MM"),
      thursday: weekStart.plus({ days: 3 }).toFormat("dd.MM"),
      friday: weekStart.plus({ days: 4 }).toFormat("dd.MM"),
    };
  });

  let regularWeekCount = 0;
  let catchUpWeekCount = 0;

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
        {schedule.map((week, i) => {
          const weekLabel =
            tournamentWeeks[i].status === "regular"
              ? `Woche ${++regularWeekCount}`
              : `Nachholwoche ${++catchUpWeekCount}`;

          return (
            <TableRow key={week.id}>
              <TableCell className="font-semibold text-nowrap">
                {weekLabel}
              </TableCell>
              <TableCell className="text-center">{week.tuesday}</TableCell>
              <TableCell className="text-center">{week.thursday}</TableCell>
              <TableCell className="text-center">{week.friday}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
