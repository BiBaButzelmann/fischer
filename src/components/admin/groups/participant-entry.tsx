import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ParticipantWithName } from "@/db/types/participant";
import { Crown } from "lucide-react";
import { UserWeekdayDisplay } from "../user-weekday-display";
import { getTwz } from "@/lib/twz";

export function ParticipantEntry({
  participant,
  promotionTarget,
  showMatchDays = true,
  showFideRating = true,
  showDwzRating = true,
}: {
  participant: ParticipantWithName;
  promotionTarget?: string;
  showMatchDays?: boolean;
  showFideRating?: boolean;
  showDwzRating?: boolean;
}) {
  const twz = getTwz(participant);
  const fideIsTwz =
    participant.fideRating !== null && participant.fideRating === twz;
  const dwzIsTwz =
    participant.dwzRating !== null && participant.dwzRating === twz;

  return (
    <div className="flex items-center gap-2 py-1">
      {promotionTarget ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Crown className="h-4 w-4 shrink-0 text-amber-500" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Aufstiegsrecht in Gruppe {promotionTarget}</p>
          </TooltipContent>
        </Tooltip>
      ) : null}
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
        <Badge
          variant={fideIsTwz ? "default" : "outline"}
          title={fideIsTwz ? "Turnierwertungszahl (TWZ)" : undefined}
          className="whitespace-nowrap w-[75px]"
        >
          FIDE {participant?.fideRating ?? "0"}
        </Badge>
      )}
      {showDwzRating && (
        <Badge
          variant={dwzIsTwz ? "default" : "secondary"}
          title={dwzIsTwz ? "Turnierwertungszahl (TWZ)" : undefined}
          className="whitespace-nowrap w-[75px]"
        >
          DWZ {participant?.dwzRating ?? "0"}
        </Badge>
      )}
    </div>
  );
}
