"use client";

import { DateTime } from "luxon";
import { WeekContainer } from "./week-container";
import { SelectedCalendarWeeksContainer } from "./selected-weeks-container";
import { type Week, type WeekDay } from "./types";

export function EditTournamentWeeks({
  weeks,
  onChange,
}: {
  weeks: Week[];
  onChange: (weeks: Week[]) => void;
}) {
  const handleAddWeek = () => {
    const currentDate = DateTime.now();

    let newWeekNumber = currentDate.weekNumber;
    if (weeks.length > 0) {
      const lastWeek = weeks[weeks.length - 1];
      if (lastWeek.weekNumber >= currentDate.weekNumber) {
        newWeekNumber = lastWeek.weekNumber + 1;
      }
    }

    onChange([
      ...weeks,
      {
        index: weeks.length,
        status: "regular",
        weekNumber: newWeekNumber,
        tuesday: { refereeNeeded: true },
        thursday: { refereeNeeded: false },
        friday: { refereeNeeded: true },
      },
    ]);
  };

  const handleWeekChange = (index: number, newCalendarWeek: number) => {
    const updatedWeeks = [...weeks];
    if (updatedWeeks[index]) {
      updatedWeeks[index].weekNumber = newCalendarWeek;
    }
    onChange(updatedWeeks);
  };

  const handleDeleteWeek = (index: number) => {
    onChange(weeks.filter((_, i) => i !== index));
  };

  const handleUpdateWeekStatus = (
    index: number,
    status: "regular" | "catch-up",
  ) => {
    const updatedWeeks = [...weeks];
    if (updatedWeeks[index]) {
      updatedWeeks[index].status = status;
    }
    onChange(updatedWeeks);
  };

  const handleUpdateRefereeNeeded = (
    index: number,
    day: WeekDay,
    value: boolean,
  ) => {
    const updatedWeeks = [...weeks];
    if (updatedWeeks[index]) {
      updatedWeeks[index][day].refereeNeeded = value;
    }
    onChange(updatedWeeks);
  };

  return (
    <div className="space-y-4">
      {weeks.length > 0 ? (
        <div className="border-gray-200 border-2 rounded-md px-3 py-1 text-sm">
          <div className="p-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Turnierspieltage</h3>
            </div>
            <div className="flex flex-col gap-3">
              {weeks.map((week) => (
                <WeekContainer
                  key={`${week.index}-${week.weekNumber}`}
                  week={week}
                  weeks={weeks}
                  onDeleteWeek={handleDeleteWeek}
                  onUpdateWeekStatus={handleUpdateWeekStatus}
                  onUpdateRefereeNeeded={handleUpdateRefereeNeeded}
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}
      <div className="border-gray-200 border-2 rounded-md px-3 py-1 text-sm">
        <SelectedCalendarWeeksContainer
          selectedCalendarWeeks={weeks}
          onAddWeek={handleAddWeek}
          onWeekChange={handleWeekChange}
        />
      </div>
    </div>
  );
}
