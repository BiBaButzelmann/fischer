import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { SetupHelperWithName } from "@/db/types/setup-helper";
import { UserWeekday } from "./user-weekday";

type Props = {
  setupHelper: SetupHelperWithName;
  onDelete: () => void;
};

export function SetupHelperEntry({ setupHelper, onDelete }: Props) {
  return (
    <div className="flex items-center">
      <span className="inline-flex flex-1">
        {setupHelper.profile.firstName} {setupHelper.profile.lastName}
      </span>
      <UserWeekday
        preferredMatchDay={setupHelper.preferredMatchDay}
        secondaryMatchDays={setupHelper.secondaryMatchDays}
      />
      <Button variant="outline" size="icon" className="ml-2" onClick={onDelete}>
        <Trash />
      </Button>
    </div>
  );
}
