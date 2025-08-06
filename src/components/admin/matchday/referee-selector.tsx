import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefereeWithName } from "@/db/types/referee";
import { Badge } from "@/components/ui/badge";
import { matchDaysShort } from "@/constants/constants";

type Props = {
  referees: RefereeWithName[];
  onSelect: (value: string) => void;
  value?: string;
};

export function RefereeSelector({ referees, onSelect, value = "" }: Props) {
  return (
    <Select value={value} onValueChange={onSelect}>
      <SelectTrigger>
        <SelectValue placeholder="Schiedsrichter wählen..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">Kein Schiedsrichter</SelectItem>
        {referees.map((referee) => (
          <SelectItem key={referee.id} value={referee.id.toString()}>
            <div className="flex items-center justify-between w-full">
              <span>
                {referee.profile.firstName} {referee.profile.lastName}
              </span>
              <div className="flex gap-1 ml-2">
                <Badge variant="default" className="text-xs px-1 py-0">
                  {matchDaysShort[referee.preferredMatchDay]}
                </Badge>
                {referee.secondaryMatchDays.length > 0 &&
                  referee.secondaryMatchDays.map((day) => (
                    <Badge
                      key={day}
                      variant="secondary"
                      className="text-xs px-1 py-0"
                    >
                      {matchDaysShort[day]}
                    </Badge>
                  ))}
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
