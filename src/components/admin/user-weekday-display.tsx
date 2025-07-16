import { matchDaysShort } from "@/constants/constants";
import { Badge } from "../ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
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
    <HoverCard>
      <HoverCardTrigger asChild>
        <Badge className="bg-green-600 hover:bg-green-600 cursor-default w-9">
          {matchDaysShort[preferredMatchDay]}
        </Badge>
      </HoverCardTrigger>
      <HoverCardContent>
        {secondaryMatchDays.length > 0 ? (
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">
              Alternative Wochentage:
            </span>
            <div className="flex gap-1">
              {secondaryMatchDays.map((day) => (
                <Badge
                  key={day}
                  className="bg-green-400 hover:bg-green-600 cursor-default"
                >
                  {matchDaysShort[day]}
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">
            Keine alternativen Wochentage
          </span>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
