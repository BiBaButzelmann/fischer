import { buildGameViewUrl } from "@/lib/navigation";
import { Gavel } from "lucide-react";
import { UpcomingEvent, EventIcon } from "./upcoming-event";

type UpcomingRefereeEventProps = {
  tournamentId: number;
  matchdayId: number;
  start: Date;
};

export function UpcomingRefereeEvent({
  tournamentId,
  matchdayId,
  start,
}: UpcomingRefereeEventProps) {
  return (
    <UpcomingEvent
      title="Schiedsrichter"
      start={start}
      url={buildGameViewUrl({ tournamentId, matchdayId })}
      icon={
        <EventIcon
          icon={Gavel}
          backgroundColor="bg-red-100"
          iconColor="bg-red-600"
        />
      }
    />
  );
}
