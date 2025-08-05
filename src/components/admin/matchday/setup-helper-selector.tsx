import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SetupHelperWithName } from "@/db/types/setup-helper";
import { matchDaysShort } from "@/constants/constants";
import { X } from "lucide-react";

type Props = {
  setupHelpers: SetupHelperWithName[];
  selectedHelpers: SetupHelperWithName[];
  onAdd: (helperId: string) => void;
  onRemove: (helperId: number) => void;
};

export function SetupHelperSelector({
  setupHelpers,
  selectedHelpers,
  onAdd,
  onRemove,
}: Props) {
  const selectedIds = new Set(selectedHelpers.map((helper) => helper.id));
  const availableHelpers = setupHelpers.filter(
    (helper) => !selectedIds.has(helper.id),
  );

  return (
    <div className="space-y-2">
      {availableHelpers.length > 0 && (
        <Select value="" onValueChange={onAdd}>
          <SelectTrigger>
            <SelectValue placeholder="Aufbauhelfer hinzufügen..." />
          </SelectTrigger>
          <SelectContent>
            {availableHelpers.map((setupHelper) => (
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
      )}

      {selectedHelpers.length > 0 && (
        <div className="space-y-1">
          {selectedHelpers.map((helper) => (
            <div
              key={helper.id}
              className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {helper.profile.firstName} {helper.profile.lastName}
                </span>
                <div className="flex gap-1">
                  <Badge className="text-xs">
                    {matchDaysShort[helper.preferredMatchDay]}
                  </Badge>
                  {helper.secondaryMatchDays.length > 0 &&
                    helper.secondaryMatchDays.map((day) => (
                      <Badge key={day} variant="outline" className="text-xs">
                        {matchDaysShort[day]}
                      </Badge>
                    ))}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(helper.id)}
                className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
