import { CalendarIcon } from "lucide-react";
import { DateTime } from "luxon";
import { type Week } from "./types";
import { WeekCalendar } from "./week-calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export function SelectedWeeks({
  selectedWeeks,
  onWeekChange,
}: {
  selectedWeeks: Week[];
  onWeekChange: (index: number, newCalendarWeek: number) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {selectedWeeks.map((week, index) => (
        <div key={index}>
          <Label htmlFor={`week-date-${index}`} className="text-sm font-medium">
            Woche {index + 1}
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal mt-1 px-2 py-1 h-auto hover:bg-secondary hover:text-black"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span className="flex flex-col">
                  <span className="font-medium">
                    {getCalendarWeek(week.weekNumber)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {getWeekRange(week.weekNumber)}
                  </span>
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-md">
              <WeekCalendar
                weekNumber={week.weekNumber}
                onSelect={(weekNumber) => {
                  console.log("Selected week number:", weekNumber);
                  if (weekNumber === undefined) {
                    return;
                  }
                  onWeekChange(index, weekNumber);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      ))}
    </div>
  );
}

function getCalendarWeek(weekNumber: number) {
  const date = DateTime.now().set({ weekNumber });
  return `KW (${date.toFormat("n/yyyy")})`;
}

function getWeekRange(weekNumber: number) {
  const startOfWeek = DateTime.now().set({ weekNumber }).startOf("week");
  const endOfWeek = startOfWeek.endOf("week");
  return `${startOfWeek.toFormat("dd.MM")} - ${endOfWeek.toFormat("dd.MM.yyyy")}`;
}
