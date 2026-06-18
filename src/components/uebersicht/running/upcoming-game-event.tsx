import { buildGameViewUrl } from "@/lib/navigation";
import { Gamepad2 } from "lucide-react";
import { EventIcon, UpcomingEvent } from "./upcoming-event";

type Props = {
  slug: string;
  groupId: number;
  round: number;
  participantId: number;
  start: Date;
};

export function UpcomingGameEvent({
  slug,
  groupId,
  round,
  participantId,
  start,
}: Props) {
  return (
    <UpcomingEvent
      title="Partie"
      start={start}
      url={buildGameViewUrl({
        slug,
        groupId,
        round,
        participantId,
      })}
      icon={
        <EventIcon
          icon={Gamepad2}
          backgroundColor="bg-blue-100"
          iconColor="text-blue-600"
        />
      }
    />
  );
}
