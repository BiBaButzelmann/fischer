"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { updateRefereeIdByMatchdayId } from "@/actions/match-day";
import { RefereeWithName } from "@/db/types/referee";
import { MatchDayWithReferee } from "@/db/types/match-day";
import { RefereeSelector } from "./referee-selector";
import { DateTime } from "luxon";
import { displayShortDateOrHoliday } from "@/lib/date";
import { generateRefereeAssignmentSchedule } from "@/lib/tournament-schedule";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Props = {
  referees: RefereeWithName[];
  matchdays: MatchDayWithReferee[];
};

export function RefereeAssignmentForm({ referees, matchdays }: Props) {
  const [assignments, setAssignments] = useState<
    Record<number, RefereeWithName | null>
  >(
    matchdays.reduce(
      (acc, matchday) => {
        acc[matchday.id] = matchday.referee;
        return acc;
      },
      {} as Record<number, RefereeWithName | null>,
    ),
  );
  const [isPending, startTransition] = useTransition();
  const [changedMatchdays, setChangedMatchdays] = useState<Set<number>>(
    new Set(),
  );

  const handleAssignmentChange = (
    matchdayId: number,
    refereeId: string | null,
  ) => {
    setAssignments((prev) => ({
      ...prev,
      [matchdayId]:
        refereeId === "none" || !refereeId
          ? null
          : referees.find((r) => r.id.toString() === refereeId) || null,
    }));
    setChangedMatchdays((prev) => new Set(prev).add(matchdayId));
  };

  const handleSave = () => {
    startTransition(async () => {
      const promises = Array.from(changedMatchdays).map((matchdayId) => {
        const referee = assignments[matchdayId];
        const refereeId = referee ? referee.id : null;
        return updateRefereeIdByMatchdayId(matchdayId, refereeId);
      });

      await Promise.all(promises);
      setChangedMatchdays(new Set());
    });
  };

  const groupedMatchdays = matchdays.reduce(
    (acc, matchday) => {
      const weekId = matchday.tournamentWeekId;
      if (!acc[weekId]) {
        acc[weekId] = {
          week: matchday.tournamentWeek,
          matchdays: [],
        };
      }
      acc[weekId].matchdays.push(matchday);
      return acc;
    },
    {} as Record<
      number,
      {
        week: MatchDayWithReferee["tournamentWeek"];
        matchdays: MatchDayWithReferee[];
      }
    >,
  );

  const schedule = generateRefereeAssignmentSchedule(
    groupedMatchdays,
    (matchdays, dayOfWeek) =>
      matchdays.find((md) => md.dayOfWeek === dayOfWeek),
  );

  const displayDateWithStyling = (date: DateTime) => {
    const dateText = displayShortDateOrHoliday(date);
    if (dateText === "Feiertag") {
      return <span className="text-red-500 italic">Feiertag</span>;
    }
    return <span className="text-gray-900">{dateText}</span>;
  };

  const displayReferee = (matchday: MatchDayWithReferee | undefined) => {
    if (!matchday || !matchday.refereeNeeded) {
      return (
        <div className="text-xs text-gray-400 italic">
          Kein Schiedsrichter benötigt
        </div>
      );
    }

    const currentReferee = assignments[matchday.id];

    return (
      <div className="space-y-2">
        <RefereeSelector
          referees={referees}
          value={currentReferee ? currentReferee.id.toString() : "none"}
          onSelect={(value) => handleAssignmentChange(matchday.id, value)}
        />
      </div>
    );
  };

  if (matchdays.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Keine Spieltage verfügbar
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end items-center">
        <Button
          onClick={handleSave}
          disabled={isPending || changedMatchdays.size === 0}
        >
          {isPending ? "Speichern..." : "Speichern"}
        </Button>
      </div>
      <div className="border rounded-lg overflow-hidden">
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
            {schedule.map((week, index) => (
              <TableRow key={week.week.id}>
                <TableCell className="font-semibold text-nowrap">
                  {week.weekLabel}
                </TableCell>
                <TableCell className="text-center min-w-[200px]">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">
                      {displayDateWithStyling(week.tuesday.date)}
                    </div>
                    {displayReferee(week.tuesday.matchday)}
                  </div>
                </TableCell>
                <TableCell className="text-center min-w-[200px]">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">
                      {displayDateWithStyling(week.thursday.date)}
                    </div>
                    {displayReferee(week.thursday.matchday)}
                  </div>
                </TableCell>
                <TableCell className="text-center min-w-[200px]">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">
                      {displayDateWithStyling(week.friday.date)}
                    </div>
                    {displayReferee(week.friday.matchday)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
