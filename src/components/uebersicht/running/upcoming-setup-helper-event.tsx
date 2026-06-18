import { Wrench } from "lucide-react";
import { UpcomingEvent, EventIcon } from "./upcoming-event";
import { tournamentPath } from "@/lib/navigation";

type Props = {
  start: Date;
  slug: string;
};

export async function UpcomingSetupHelperEvent({ start, slug }: Props) {
  return (
    <UpcomingEvent
      title="Aufbauhelfer"
      start={start}
      url={tournamentPath(slug, "/terminuebersicht")}
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
