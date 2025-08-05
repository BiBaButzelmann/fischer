"use client";

import { useState, useTransition, Fragment } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  updateRefereeIdByMatchdayId,
  updateSetupHelpersForMatchday,
} from "@/actions/match-day";
import { RefereeWithName } from "@/db/types/referee";
import { MatchDayWithRefereeAndSetupHelpers } from "@/db/types/match-day";
import { SetupHelperWithName } from "@/db/types/setup-helper";
import { SetupHelperSelector } from "./setup-helper-selector";
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
import { RefereeSelector } from "./referee-selector";
import { useSetupHelperAssignments } from "@/hooks/useSetupHelperAssignments";

type Props = {
  referees: RefereeWithName[];
  matchdays: MatchDayWithRefereeAndSetupHelpers[];
  setupHelpers: SetupHelperWithName[];
};

export function MatchdayAssignmentForm({
  referees,
  matchdays,
  setupHelpers,
}: Props) {
  const [refereeAssignments, setRefereeAssignments] = useState<
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

  const initialSetupHelperAssignments = matchdays.reduce(
    (acc, matchday) => {
      acc[matchday.id] = matchday.setupHelpers.map((sh) => sh.setupHelper);
      return acc;
    },
    {} as Record<number, SetupHelperWithName[]>,
  );

  const {
    assignments: setupHelperAssignments,
    addHelperToMatchday,
    removeHelperFromMatchday,
    getAssignmentsByMatchday,
  } = useSetupHelperAssignments(initialSetupHelperAssignments, setupHelpers);

  const [isPending, startTransition] = useTransition();
  const [changedMatchdays, setChangedMatchdays] = useState<Set<number>>(
    new Set(),
  );

  const handleRefereeAssignmentChange = (
    matchdayId: number,
    refereeId: string | null,
  ) => {
    setRefereeAssignments((prev) => ({
      ...prev,
      [matchdayId]:
        refereeId === "none" || !refereeId
          ? null
          : referees.find((r) => r.id.toString() === refereeId) || null,
    }));
    setChangedMatchdays((prev) => new Set(prev).add(matchdayId));
  };

  const handleSetupHelperAdd = (matchdayId: number, setupHelperId: string) => {
    addHelperToMatchday(matchdayId, setupHelperId);
    setChangedMatchdays((prev) => new Set(prev).add(matchdayId));
  };

  const handleSetupHelperRemove = (
    matchdayId: number,
    setupHelperId: number,
  ) => {
    removeHelperFromMatchday(matchdayId, setupHelperId);
    setChangedMatchdays((prev) => new Set(prev).add(matchdayId));
  };

  const handleSave = () => {
    startTransition(async () => {
      const setupHelperIdsByMatchday = getAssignmentsByMatchday();

      const promises = Array.from(changedMatchdays).map(async (matchdayId) => {
        const referee = refereeAssignments[matchdayId];
        const refereeId = referee ? referee.id : null;
        const setupHelperIds = setupHelperIdsByMatchday[matchdayId] || [];

        await Promise.all([
          updateRefereeIdByMatchdayId(matchdayId, refereeId),
          updateSetupHelpersForMatchday(matchdayId, setupHelperIds),
        ]);
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
        week: MatchDayWithRefereeAndSetupHelpers["tournamentWeek"];
        matchdays: MatchDayWithRefereeAndSetupHelpers[];
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

  const displayAssignments = (
    matchday: MatchDayWithRefereeAndSetupHelpers | undefined,
  ) => {
    if (!matchday || !matchday.refereeNeeded) {
      return {
        date: "",
        referee: (
          <div className="text-xs text-gray-400 italic">
            Keine Schiedsrichter benötigt
          </div>
        ),
        setupHelper: (
          <div className="text-xs text-gray-400 italic">
            Kein Aufbauhelfer benötigt
          </div>
        ),
      };
    }

    const currentReferee = refereeAssignments[matchday.id];
    const currentSetupHelpers = setupHelperAssignments[matchday.id] || [];

    return {
      date: format(matchday.date, "dd.MM.yy"),
      referee: (
        <RefereeSelector
          referees={referees}
          onSelect={(value) =>
            handleRefereeAssignmentChange(matchday.id, value)
          }
          value={currentReferee ? currentReferee.id.toString() : "none"}
        />
      ),
      setupHelper: (
        <SetupHelperSelector
          setupHelpers={setupHelpers}
          selectedHelpers={currentSetupHelpers}
          onAdd={(setupHelperId) =>
            handleSetupHelperAdd(matchday.id, setupHelperId)
          }
          onRemove={(setupHelperId) =>
            handleSetupHelperRemove(matchday.id, setupHelperId)
          }
        />
      ),
    };
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">Woche</TableHead>
              <TableHead className="text-center">Dienstag</TableHead>
              <TableHead className="text-center">Donnerstag</TableHead>
              <TableHead className="text-center">Freitag</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedule.map((week) => {
              const tuesdayData = displayAssignments(week.tuesday.matchday);
              const thursdayData = displayAssignments(week.thursday.matchday);
              const fridayData = displayAssignments(week.friday.matchday);

              return (
                <Fragment key={week.week.id}>
                  {/* Date Row */}
                  <TableRow className="border-b-2 border-gray-300">
                    <TableCell className="font-semibold text-nowrap align-middle border-r-2 border-gray-300">
                      {week.weekLabel}
                    </TableCell>
                    <TableCell className="text-center text-sm font-medium">
                      {displayDateWithStyling(week.tuesday.date)}
                    </TableCell>
                    <TableCell className="text-center text-sm font-medium">
                      {displayDateWithStyling(week.thursday.date)}
                    </TableCell>
                    <TableCell className="text-center text-sm font-medium">
                      {displayDateWithStyling(week.friday.date)}
                    </TableCell>
                  </TableRow>

                  {/* Referee Row */}
                  <TableRow className="border-b border-gray-200">
                    <TableCell className="font-medium text-nowrap align-middle border-r-2 border-gray-300 text-sm text-gray-600">
                      Schiedsrichter
                    </TableCell>
                    <TableCell className="text-center min-w-[200px] bg-blue-50/50">
                      {tuesdayData.referee}
                    </TableCell>
                    <TableCell className="text-center min-w-[200px] bg-blue-50/50">
                      {thursdayData.referee}
                    </TableCell>
                    <TableCell className="text-center min-w-[200px] bg-blue-50/50">
                      {fridayData.referee}
                    </TableCell>
                  </TableRow>

                  {/* Setup Helper Row */}
                  <TableRow className="border-b-2 border-gray-300">
                    <TableCell className="font-medium text-nowrap align-middle border-r-2 border-gray-300 text-sm text-gray-600">
                      Aufbauhelfer
                    </TableCell>
                    <TableCell className="text-center min-w-[200px] bg-green-50/50">
                      {tuesdayData.setupHelper}
                    </TableCell>
                    <TableCell className="text-center min-w-[200px] bg-green-50/50">
                      {thursdayData.setupHelper}
                    </TableCell>
                    <TableCell className="text-center min-w-[200px] bg-green-50/50">
                      {fridayData.setupHelper}
                    </TableCell>
                  </TableRow>
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
