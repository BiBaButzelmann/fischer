import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { TournamentDayCard } from "./tournament-day-card";
import { type Week, type WeekDay, type WeekStatus } from "./types";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function WeekContainer({
  week,
  weeks,
  onDeleteWeek,
  onUpdateWeekStatus,
  onUpdateRefereeNeeded,
}: {
  week: Week;
  weeks: Week[];
  onDeleteWeek: (index: number) => void;
  onUpdateWeekStatus: (index: number, status: WeekStatus) => void;
  onUpdateRefereeNeeded: (index: number, day: WeekDay, value: boolean) => void;
}) {
  const getWeekLabel = (week: Week) => {
    return week.status === "regular" ? `Reguläre Woche` : `Nachholwoche`;
  };

  const weekNumber = getWeekNumberforType(week, weeks);
  const weekTitle =
    week.status === "regular"
      ? `Woche ${weekNumber}`
      : `Nachholwoche ${weekNumber}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h4 className="font-medium text-base">{weekTitle}</h4>
          <Badge
            className={cn(
              week.status === "regular"
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-orange-600 hover:bg-orange-700 text-white",
            )}
          >
            {getWeekLabel(week)}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Wochenstatus:</Label>
            <Select
              value={week.status}
              onValueChange={(status: "regular" | "catch-up") => {
                onUpdateWeekStatus(week.index, status);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Reguläre Woche</SelectItem>
                <SelectItem value="catch-up">Nachholwoche</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onDeleteWeek(week.index)}
            aria-label={`${getWeekLabel(week)} entfernen`}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 rounded-lg border-2">
        <TournamentDayCard
          day="tuesday"
          week={week}
          onUpdateRefereeNeeded={onUpdateRefereeNeeded}
        />
        <TournamentDayCard
          day="thursday"
          week={week}
          onUpdateRefereeNeeded={onUpdateRefereeNeeded}
        />
        <TournamentDayCard
          day="friday"
          week={week}
          onUpdateRefereeNeeded={onUpdateRefereeNeeded}
        />
      </div>
    </div>
  );
}
const getWeekNumberforType = (currentWeek: Week, allWeeks: Week[]) => {
  const weeksOfSameType = allWeeks
    .slice(0, allWeeks.findIndex((w) => w.index === currentWeek.index) + 1)
    .filter((w) => w.status === currentWeek.status);
  return weeksOfSameType.length;
};
