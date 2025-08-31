import { buildGameViewUrl } from "@/lib/navigation";
import { Gavel } from "lucide-react";
import { UpcomingEvent, EventIcon } from "./upcoming-event";

type Props = {
  tournamentId: number;
  matchdayId: number;
  start: Date;
};

export function UpcomingRefereeEvent({
  tournamentId,
  matchdayId,
  start,
}: Props) {
  return (
    <UpcomingEvent
      title="Schiedsrichter"
      start={start}
      url={buildGameViewUrl({ tournamentId, matchdayId })}
      icon={
        <EventIcon
          icon={Gavel}
          backgroundColor="bg-red-100"
          iconColor="text-red-600"
        />
      }
    />
  );
}
