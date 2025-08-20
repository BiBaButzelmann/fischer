import { useRouter } from "next/navigation";
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
  const router = useRouter();

  const handleClick = () => {
    const url = buildGameViewUrl({
      tournamentId,
      matchdayId,
    });
    router.push(url);
  };

  return (
    <UpcomingEvent
      title="Schiedsrichter"
      start={start}
      onClick={handleClick}
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
