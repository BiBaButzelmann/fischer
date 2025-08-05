import { DayOfWeek } from "@/db/types/group";
import { SetupHelperWithName } from "@/db/types/setup-helper";
import { SetupHelperSelector } from "./setup-helper-selector";
import { SetupHelperEntry } from "./setup-helper-entry";
import { matchDays } from "@/constants/constants";

type Props = {
  day: DayOfWeek;
  setupHelpers: SetupHelperWithName[];
  assignedHelpers: SetupHelperWithName[];
  onAddHelper: (helperId: string) => void;
  onRemoveHelper: (helperId: number) => void;
};

export function DayAssignmentCard({
  day,
  setupHelpers,
  assignedHelpers,
  onAddHelper,
  onRemoveHelper,
}: Props) {
  return (
    <div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          {matchDays[day]}
        </label>
        <SetupHelperSelector
          setupHelpers={setupHelpers}
          onSelect={(value) => onAddHelper(value)}
        />
      </div>
      <div className="mt-2">
        {assignedHelpers.map((helper) => (
          <div key={helper.id} className="px-2 py-2 bg-gray-100 rounded mb-1">
            <SetupHelperEntry
              setupHelper={helper}
              onDelete={() => onRemoveHelper(helper.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
