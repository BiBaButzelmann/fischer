import { Gavel } from "lucide-react";
import { UpcomingEvent, EventIcon } from "./upcoming-event";

type Props = {
  start: Date;
};

export function UpcomingRefereeEvent({ start }: Props) {
  return (
    <UpcomingEvent
      title="Schiedsrichter"
      start={start}
      url="/terminuebersicht"
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
