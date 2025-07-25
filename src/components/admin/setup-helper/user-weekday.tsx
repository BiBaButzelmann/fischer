import { Badge } from "@/components/ui/badge";
import { DayOfWeek } from "@/db/types/group";
import { matchDaysShort } from "@/constants/constants";

interface UserWeekdayProps {
  preferredMatchDay: DayOfWeek;
  secondaryMatchDays: DayOfWeek[];
}

export function UserWeekday({
  preferredMatchDay,
  secondaryMatchDays,
}: UserWeekdayProps) {
  return (
    <div className="flex gap-1">
      <Badge>{matchDaysShort[preferredMatchDay]}</Badge>
      {secondaryMatchDays.length > 0 &&
        secondaryMatchDays.map((day) => (
          <Badge key={day} variant="secondary">
            {matchDaysShort[day]}
          </Badge>
        ))}
    </div>
  );
}
