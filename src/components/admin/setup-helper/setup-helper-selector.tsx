import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SetupHelperWithName } from "@/db/types/setup-helper";
import { Badge } from "@/components/ui/badge";
import { matchDaysShort } from "@/constants/constants";

interface SetupHelperSelectorProps {
  setupHelpers: SetupHelperWithName[];
  onSelect: (value: string) => void;
}

export function SetupHelperSelector({
  setupHelpers,
  onSelect,
}: SetupHelperSelectorProps) {
  return (
    <Select value="" onValueChange={onSelect}>
      <SelectTrigger>
        <SelectValue placeholder="Aufbauhelfer hinzufügen..." />
      </SelectTrigger>
      <SelectContent>
        {setupHelpers.map((setupHelper) => (
          <SelectItem
            key={setupHelper.id}
            value={setupHelper.id.toString()}
            className="flex items-center justify-between"
          >
            {setupHelper.profile.firstName} {setupHelper.profile.lastName}{" "}
            <div className="flex gap-1">
              <Badge>{matchDaysShort[setupHelper.preferredMatchDay]}</Badge>
              {setupHelper.secondaryMatchDays.length > 0 &&
                setupHelper.secondaryMatchDays.map((day) => (
                  <Badge key={day} variant="secondary">
                    {matchDaysShort[day]}
                  </Badge>
                ))}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
