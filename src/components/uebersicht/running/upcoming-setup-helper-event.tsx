import { buildGameViewUrl } from "@/lib/navigation";
import { Wrench } from "lucide-react";
import { UpcomingEvent, EventIcon } from "./upcoming-event";
import { DateTime } from "luxon";

type Props = {
  tournamentId: number;
  matchdayId: number;
  start: DateTime;
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
          iconColor="text-green-600"
        />
      }
    />
  );
}
