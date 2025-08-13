import { Badge } from "@/components/ui/badge";
import { ParticipantWithName } from "@/db/types/participant";
import { UserWeekdayDisplay } from "../user-weekday-display";
import { Rabbit, Turtle } from "lucide-react";

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
        <p className="font-semibold flex-grow truncate text-red-500">
          Teilnehmer-Daten nicht verfügbar, bitte Paarungen neu generieren.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 py-1">
      <div className="flex-shrink-0">
        {participant.fideId ? (
          <Rabbit className="h-4 w-4 text-purple-600" />
        ) : (
          <Turtle className="h-4 w-4 text-orange-500" />
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
