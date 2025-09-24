import { getParticipantFullName } from "@/lib/participant";
import { ParticipantWithName } from "@/db/types/participant";
import { type ClassValue } from "clsx";
import { cn } from "@/lib/utils";

type Props = {
  participant: ParticipantWithName;
  result: string;
  className: ClassValue;
};

export function PlayerDisplay({ participant, result, className }: Props) {
  const titlePrefix = participant.title ? `${participant.title} ` : "";
  const rating = participant.dwzRating ?? participant.fideRating;
  const displayName = getParticipantFullName(participant);

  return (
    <div
      className={cn("px-3 py-1 bg-white flex items-center gap-3", className)}
    >
      <div className="text-sm font-bold text-gray-900">{result}</div>
      <div className="w-px h-3 bg-gray-300"></div>

      <div className="flex items-center gap-2 flex-1">
        {titlePrefix && (
          <span className="text-sm font-medium text-orange-600">
            {titlePrefix.trim()}
          </span>
        )}
        <span className="text-sm font-bold text-gray-900">{displayName}</span>
        {rating && <span className="text-sm text-gray-600">{rating}</span>}
      </div>
    </div>
  );
}
