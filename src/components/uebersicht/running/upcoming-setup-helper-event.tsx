import { useRouter } from "next/navigation";
import { buildGameViewUrl } from "@/lib/navigation";
import { Wrench } from "lucide-react";
import { UpcomingEvent, EventIcon } from "./upcoming-event";

type UpcomingSetupHelperEventProps = {
  tournamentId: number;
  matchdayId: number;
  start: Date;
};

export function UpcomingSetupHelperEvent({
  tournamentId,
  matchdayId,
  start,
}: UpcomingSetupHelperEventProps) {
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
      title="Setup-Helfer"
      start={start}
      onClick={handleClick}
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
