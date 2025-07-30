import { type EventContentArg } from "@fullcalendar/core/index.js";
import { cn } from "@/lib/utils";

type Props = {
  eventInfo: EventContentArg;
  isDragging?: boolean;
  isSingleEvent?: boolean;
};

export function GameEvent({
  eventInfo,
  isDragging = false,
  isSingleEvent = false,
}: Props) {
  return (
    <div
      className={cn(
        "w-full p-2 rounded-md transition-colors",
        "bg-red-100 dark:bg-red-700/40 text-red-800 dark:text-red-100",
        "hover:bg-red-200 dark:hover:bg-red-700/60",
        "border border-red-200 dark:border-red-600/50",
        "flex flex-col justify-center",
        isSingleEvent ? "min-h-[60px] flex-1" : "min-h-[40px]",
        isDragging ? "cursor-grabbing opacity-75" : "cursor-pointer",
      )}
    >
      {eventInfo.timeText && (
        <div className="font-semibold text-xs mb-1 opacity-90">
          {eventInfo.timeText}
        </div>
      )}
      <div className="text-xs leading-tight font-medium">
        {eventInfo.event.title}
      </div>
    </div>
  );
}
