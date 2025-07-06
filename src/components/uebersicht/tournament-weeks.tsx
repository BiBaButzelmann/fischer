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
      tuesday: weekStart.plus({ days: 1 }).toFormat("dd.MM"),
      thursday: weekStart.plus({ days: 3 }).toFormat("dd.MM"),
      friday: weekStart.plus({ days: 4 }).toFormat("dd.MM"),
    };
  });

  return (
    <Table className="w-full">
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Woche</TableHead>
          <TableHead className="text-center">Dienstag</TableHead>
          <TableHead className="text-center">Donnerstag</TableHead>
          <TableHead className="text-center">Freitag</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {schedule.map((week, i) => (
          <TableRow key={week.id}>
            <TableCell className="font-semibold text-nowrap">
              Woche {i + 1}
            </TableCell>
            <TableCell className="text-center">{week.tuesday}</TableCell>
            <TableCell className="text-center">{week.thursday}</TableCell>
            <TableCell className="text-center">{week.friday}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
