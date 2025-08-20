import { Badge } from "@/components/ui/badge";
import { ParticipantWithName } from "@/db/types/participant";
import { UserWeekdayDisplay } from "../user-weekday-display";
import { Bird, Rabbit, Turtle } from "lucide-react";

export function ParticipantEntry({
  participant,
  showMatchDays = true,
  showFideRating = true,
  showDwzRating = true,
}: {
  participant: ParticipantWithName | undefined;
  showMatchDays?: boolean;
  showFideRating?: boolean;
  showDwzRating?: boolean;
}) {
  if (!participant) {
    return (
      <div className="flex items-center gap-2 py-1">
        <Bird className="h-4 w-4 text-amber-700" />
        <p className="font-semibold flex-grow truncate text-red-700">
          spielfrei
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 py-1">
      <div className="flex-shrink-0">
        {participant.fideId &&
        participant.birthYear &&
        participant.nationality ? (
          <Rabbit className="h-4 w-4 text-amber-700" />
        ) : (
          <Turtle className="h-4 w-4 text-green-600" />
        )}
      </div>
      <p className="font-semibold flex-grow truncate">
        {participant.profile.firstName} {participant.profile.lastName}
      </p>
      {showMatchDays && (
        <UserWeekdayDisplay
          preferredMatchDay={participant.preferredMatchDay}
          secondaryMatchDays={participant.secondaryMatchDays}
        />
      )}
      {showFideRating && (
        <Badge className="whitespace-nowrap w-[75px]">
          FIDE {participant?.fideRating ?? "?"}
        </Badge>
      )}
      {showDwzRating && (
        <Badge variant="secondary" className="whitespace-nowrap w-[75px]">
          DWZ {participant?.dwzRating ?? ""}
        </Badge>
      )}
    </div>
  );
}
