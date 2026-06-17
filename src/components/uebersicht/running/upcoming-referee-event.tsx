import { Gavel } from "lucide-react";
import { UpcomingEvent, EventIcon } from "./upcoming-event";
import { tournamentPath } from "@/lib/navigation";

type Props = {
  start: Date;
  slug: string;
};

export function UpcomingRefereeEvent({ start, slug }: Props) {
  return (
    <UpcomingEvent
      title="Schiedsrichter"
      start={start}
      url={tournamentPath(slug, "/terminuebersicht")}
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
