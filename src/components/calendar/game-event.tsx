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
  const eventType = eventInfo.event.extendedProps.eventType;

  const getEventColors = (type: string) => {
    switch (type) {
      case "game":
        return {
          bg: "bg-blue-100 dark:bg-blue-700/40",
          text: "text-blue-800 dark:text-blue-100",
          hover: "hover:bg-blue-200 dark:hover:bg-blue-700/60",
          border: "border border-blue-200 dark:border-blue-600/50",
        };
      case "referee":
        return {
          bg: "bg-red-100 dark:bg-red-700/40",
          text: "text-red-800 dark:text-red-100",
          hover: "hover:bg-red-200 dark:hover:bg-red-700/60",
          border: "border border-red-200 dark:border-red-600/50",
        };
      default:
        return {
          bg: "bg-gray-100 dark:bg-gray-700/40",
          text: "text-gray-800 dark:text-gray-100",
          hover: "hover:bg-gray-200 dark:hover:bg-gray-700/60",
          border: "border border-gray-200 dark:border-gray-600/50",
        };
    }
  };

  const colors = getEventColors(eventType);

  return (
    <div
      className={cn(
        "w-full p-2 rounded-md transition-colors",
        colors.bg,
        colors.text,
        colors.hover,
        colors.border,
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
