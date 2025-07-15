import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { MatchDay } from "@/db/types/group";
import { ParticipantWithName } from "@/db/types/participant";

const daysMap: Record<MatchDay, string> = {
  tuesday: "Di",
  thursday: "Do",
  friday: "Fr",
};

export function ParticipantEntry({
  participant,
  showMatchDays = true,
  showFideRating = true,
  showDwzRating = true,
}: {
  participant: ParticipantWithName;
  showMatchDays?: boolean;
  showFideRating?: boolean;
  showDwzRating?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 py-1">
      <p className="font-semibold flex-grow truncate">
        {participant.profile.firstName} {participant.profile.lastName}
      </p>
      {showMatchDays && (
        <HoverCard>
          <HoverCardTrigger asChild>
            <Badge className="bg-green-600 hover:bg-green-600 cursor-default w-9">
              {daysMap[participant.preferredMatchDay]}
            </Badge>
          </HoverCardTrigger>
          <HoverCardContent>
            {participant.secondaryMatchDays.length > 0 ? (
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">
                  Alternative Spieltage:
                </span>
                <div className="flex gap-1">
                  {participant.secondaryMatchDays.map((day) => (
                    <Badge
                      key={day}
                      className="bg-green-400 hover:bg-green-600 cursor-default"
                    >
                      {daysMap[day]}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">
                Keine alternativen Spieltage
              </span>
            )}
          </HoverCardContent>
        </HoverCard>
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
