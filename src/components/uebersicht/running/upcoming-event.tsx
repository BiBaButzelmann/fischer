import { formatEventDateTime } from "@/lib/date";
import { Clock, LucideIcon } from "lucide-react";
import { ReactNode } from "react";

type UpcomingEventProps = {
  title: string;
  start: Date;
  onClick: () => void;
  icon: ReactNode;
};
export function UpcomingEvent({
  title,
  start,
  onClick,
  icon,
}: UpcomingEventProps) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 p-4 bg-white dark:bg-card border border-gray-200 dark:border-card-border rounded-xl shadow-sm transition-all hover:shadow-md cursor-pointer hover:opacity-80"
    >
      {icon}
      <div className="flex-grow">
        <p className="font-bold text-gray-800 dark:text-gray-100">{title}</p>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
          <Clock className="w-4 h-4" />
          <span>{formatEventDateTime(start)}</span>
        </div>
      </div>
    </div>
  );
}

type EventIconProps = {
  icon: LucideIcon;
  backgroundColor: string;
  iconColor: string;
};
export function EventIcon({
  icon: Icon,
  backgroundColor,
  iconColor,
}: EventIconProps) {
  return (
    <div className={`flex-shrink-0 p-3 rounded-full ${backgroundColor}`}>
      <Icon className={`w-6 h-6 ${iconColor}`} />
    </div>
  );
}
