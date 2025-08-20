import { useRouter } from "next/navigation";
import { buildGameViewUrl } from "@/lib/navigation";
import { Gamepad2 } from "lucide-react";
import { EventIcon, UpcomingEvent } from "./upcoming-event";

type UpcomingGameEventProps = {
  tournamentId: number;
  groupId: number;
  round: number;
  participantId: number;
  start: Date;
};

export function UpcomingGameEvent({
  tournamentId,
  groupId,
  round,
  participantId,
  start,
}: UpcomingGameEventProps) {
  const router = useRouter();

  const handleClick = () => {
    const url = buildGameViewUrl({
      tournamentId,
      groupId,
      round,
      participantId,
    });
    router.push(url);
  };

  return (
    <UpcomingEvent
      title="Spiel"
      start={start}
      onClick={handleClick}
      icon={
        <EventIcon
          icon={Gamepad2}
          backgroundColor="bg-blue-100"
          iconColor="bg-blue-600"
        />
      }
    />
  );
}
