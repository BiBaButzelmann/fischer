import { Wrench } from "lucide-react";
import { UpcomingEvent, EventIcon } from "./upcoming-event";

type Props = {
  start: Date;
};

export async function UpcomingSetupHelperEvent({ start }: Props) {
  return (
    <UpcomingEvent
      title="Aufbauhelfer"
      start={start}
      url="/aufbauhelfer"
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
