import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TournamentWeek } from "@/db/types/tournamentWeek";

import { displayShortDateOrHoliday } from "@/lib/date";
import { generateTournamentWeeksSchedule } from "@/lib/tournament-schedule";

type Props = {
  tournamentWeeks: TournamentWeek[];
};

export function TournamentWeeks({ tournamentWeeks }: Props) {
  const schedule = generateTournamentWeeksSchedule(tournamentWeeks);

  if (tournamentWeeks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Keine Turnierwochen verfügbar
      </div>
    );
  }

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
              {displayShortDateOrHoliday(week.tuesday)}
            </TableCell>
            <TableCell className="text-center">
              {displayShortDateOrHoliday(week.thursday)}
            </TableCell>
            <TableCell className="text-center">
              {displayShortDateOrHoliday(week.friday)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
