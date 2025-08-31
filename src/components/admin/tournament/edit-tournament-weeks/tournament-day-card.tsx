import { UserCheck, UserX } from "lucide-react";
import { DateTime } from "luxon";
import { useMemo } from "react";
import { type WeekDay, type Week } from "./types";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getBerlinDateTime } from "@/lib/date";

export function TournamentDayCard({
  day,
  week,
  onUpdateRefereeNeeded,
}: {
  day: WeekDay;
  week: Week;
  onUpdateRefereeNeeded: (index: number, day: WeekDay, value: boolean) => void;
}) {
  const dates = useMemo(() => {
    const startOfWeek = getBerlinDateTime()
      .set({ weekNumber: week.weekNumber })
      .startOf("week");
    const tuesday = startOfWeek.plus({ days: 1 });
    const thursday = startOfWeek.plus({ days: 3 });
    const friday = startOfWeek.plus({ days: 4 });

    return {
      tuesday,
      thursday,
      friday,
    };
  }, [week]);

  const formatDay = (day: WeekDay) => {
    switch (day) {
      case "tuesday":
        return "Dienstag";
      case "thursday":
        return "Donnerstag";
      case "friday":
        return "Freitag";
      default:
        return "";
    }
  };

  const formatWeekdayDate = (date: DateTime) => {
    return date.toFormat("dd.MM.yyyy");
  };

  const handleUpdateRefereeNeeded = (value: boolean) => {
    onUpdateRefereeNeeded(week.index, day, value);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <Badge variant="outline" className="font-medium mb-2">
          {formatDay(day)}
        </Badge>
        <div className="text-lg font-semibold">
          {formatWeekdayDate(dates[day])}
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label
            htmlFor="referee-switch"
            className="text-sm font-medium flex items-center gap-2"
          >
            <UserCheck className="h-4 w-4" />
            Schiedsrichter:
          </Label>
          <Switch
            id="referee-switch"
            checked={week[day].refereeNeeded}
            onCheckedChange={handleUpdateRefereeNeeded}
          />
        </div>
        <div className="flex items-center gap-2 mt-2">
          {week[day].refereeNeeded ? (
            <div className="flex items-center gap-1 text-green-700 text-xs">
              <UserCheck className="h-3 w-3" />
              <span>Schiedsrichter eingeteilt</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-red-700 text-xs">
              <UserX className="h-3 w-3" />
              <span>Kein Schiedsrichter</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
