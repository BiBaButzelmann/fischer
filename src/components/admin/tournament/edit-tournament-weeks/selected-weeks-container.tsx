import { Button } from "@/components/ui/button";
import { type Week } from "./types";
import { CalendarIcon, Plus } from "lucide-react";
import { SelectedWeeks } from "./selected-weeks";

export function SelectedCalendarWeeksContainer({
  selectedCalendarWeeks,
  onAddWeek,
  onWeekChange,
}: {
  selectedCalendarWeeks: Week[];
  onAddWeek: () => void;
  onWeekChange: (index: number, newCalendarWeek: number) => void;
}) {
  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Kalenderwoche auswählen</h3>
        <Button type="button" variant="outline" onClick={onAddWeek} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Woche hinzufügen
        </Button>
      </div>
      {selectedCalendarWeeks.length === 0 ? (
        <NoWeeksSelected />
      ) : (
        <SelectedWeeks
          selectedWeeks={selectedCalendarWeeks}
          onWeekChange={onWeekChange}
        />
      )}
    </div>
  );
}

function NoWeeksSelected() {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
      <p className="font-medium">Keine Wochen ausgewählt</p>
      <p className="text-sm">
        Klicke auf &quot;Woche hinzufügen&quot;, um zu beginnen
      </p>
      <p className="text-xs mt-2 text-muted-foreground/80">
        Die erste Woche wird automatisch auf die aktuelle Woche gesetzt
      </p>
    </div>
  );
}
