import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DayOfWeek } from "@/db/types/group";

export function MatchDaysCheckboxes({
  value,
  onChange,
  preferredMatchDay,
}: {
  value: DayOfWeek[];
  onChange: (days: DayOfWeek[]) => void;
  preferredMatchDay?: DayOfWeek;
}) {
  return (
    <div className="flex gap-4">
      {preferredMatchDay !== "tuesday" ? (
        <div className="flex items-center flex-nowrap">
          <Checkbox
            id="tuesday"
            checked={value.includes("tuesday")}
            onCheckedChange={(checked) => {
              return checked
                ? onChange([...value, "tuesday"])
                : onChange(value.filter((value) => value !== "tuesday"));
            }}
          />
          <Label htmlFor="tuesday" className="ml-2">
            Di.
          </Label>
        </div>
      ) : null}
      {preferredMatchDay !== "thursday" ? (
        <div className="flex items-center flex-nowrap">
          <Checkbox
            id="thursday"
            checked={value.includes("thursday")}
            onCheckedChange={(checked) => {
              return checked
                ? onChange([...value, "thursday"])
                : onChange(value.filter((value) => value !== "thursday"));
            }}
          />
          <Label htmlFor="thursday" className="ml-2">
            Do.
          </Label>
        </div>
      ) : null}
      {preferredMatchDay !== "friday" ? (
        <div className="flex items-center flex-nowrap">
          <Checkbox
            id="friday"
            checked={value.includes("friday")}
            onCheckedChange={(checked) => {
              return checked
                ? onChange([...value, "friday"])
                : onChange(value.filter((value) => value !== "friday"));
            }}
          />
          <Label htmlFor="friday" className="ml-2">
            Fr.
          </Label>
        </div>
      ) : null}
    </div>
  );
}
