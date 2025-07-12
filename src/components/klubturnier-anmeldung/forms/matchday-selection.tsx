import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { MatchDay } from "@/db/types/group";

export function MatchDaysCheckboxes({
  value,
  onChange,
}: {
  value: MatchDay[];
  onChange: (days: MatchDay[]) => void;
}) {
  return (
    <div className="flex gap-4">
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
    </div>
  );
}
