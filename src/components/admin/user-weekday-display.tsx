import { matchDaysShort } from "@/constants/constants";
import { Badge } from "../ui/badge";
import { DayOfWeek } from "@/db/types/group";

type Props = {
  preferredMatchDay: DayOfWeek;
  secondaryMatchDays: DayOfWeek[];
};

export function UserWeekdayDisplay({
  preferredMatchDay,
  secondaryMatchDays,
}: Props) {
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
