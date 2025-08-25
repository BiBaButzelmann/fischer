import { buildGameViewUrl } from "@/lib/navigation";
import { Gamepad2 } from "lucide-react";
import { EventIcon, UpcomingEvent } from "./upcoming-event";

type Props = {
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
}: Props) {
  return (
    <UpcomingEvent
      title="Spiel"
      start={start}
      url={buildGameViewUrl({
        tournamentId,
        groupId,
        round,
        participantId,
      })}
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
