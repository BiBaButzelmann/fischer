import { Badge } from "@/components/ui/badge";
import { ParticipantWithName } from "@/db/types/participant";

export function ParticipantEntry({
  participant,
}: {
  participant: ParticipantWithName;
}) {
  return (
    <div className="flex items-center gap-2 py-1">
      <p className="font-semibold flex-grow truncate">
        {participant.profile.firstName} {participant.profile.lastName}
      </p>
      <Badge className="whitespace-nowrap w-[75px]">
        FIDE {participant?.fideRating ?? "?"}
      </Badge>
      <Badge variant="secondary" className="whitespace-nowrap w-[75px]">
        DWZ {participant?.dwzRating ?? ""}
      </Badge>
    </div>
  );
}
