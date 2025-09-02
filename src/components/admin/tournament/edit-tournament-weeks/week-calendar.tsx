import { Calendar } from "@/components/ui/calendar";
import { getCurrentLocalDateTime } from "@/lib/date";
import { DateTime } from "luxon";
import { useMemo } from "react";

export function WeekCalendar({
  weekNumber,
  onSelect,
}: {
  weekNumber: number;
  onSelect: (weekNumber: number | undefined) => void;
}) {
  const selected = useMemo(() => {
    const startOfWeek = getCurrentLocalDateTime()
      .set({ weekNumber })
      .startOf("week");
    const endOfWeek = startOfWeek.endOf("week");
    return {
      from: startOfWeek.toJSDate(),
      to: endOfWeek.toJSDate(),
    };
  }, [weekNumber]);

  const handleSelect = (date: Date) => {
    const weekNumber = DateTime.fromJSDate(date).weekNumber;
    onSelect(weekNumber);
  };

  return (
    <Calendar
      key={weekNumber}
      weekStartsOn={1}
      mode="range"
      selected={selected}
      onDayClick={handleSelect}
      showWeekNumber
      classNames={{
        today: "bg-secondary rounded-md",
      }}
    />
  );
}
