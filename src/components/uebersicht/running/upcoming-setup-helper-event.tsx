import { buildGameViewUrl } from "@/lib/navigation";
import { Wrench } from "lucide-react";
import { UpcomingEvent, EventIcon } from "./upcoming-event";

type Props = {
  tournamentId: number;
  matchdayId: number;
  start: Date;
};

export function UpcomingSetupHelperEvent({
  tournamentId,
  matchdayId,
  start,
}: Props) {
  return (
    <UpcomingEvent
      title="Aufbauhelfer"
      start={start}
      url={buildGameViewUrl({ tournamentId, matchdayId })}
      icon={
        <EventIcon
          icon={Wrench}
          backgroundColor="bg-green-100"
          iconColor="bg-green-600"
        />
      }
    />
  );
}
