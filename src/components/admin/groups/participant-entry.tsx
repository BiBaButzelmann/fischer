import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ParticipantWithName } from "@/db/types/participant";
import { Crown } from "lucide-react";
import { UserWeekdayDisplay } from "../user-weekday-display";

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
        <Badge className="whitespace-nowrap w-[75px]">
          FIDE {participant?.fideRating ?? "0"}
        </Badge>
      )}
      {showDwzRating && (
        <Badge variant="secondary" className="whitespace-nowrap w-[75px]">
          DWZ {participant?.dwzRating ?? "0"}
        </Badge>
      )}
    </div>
  );
}
