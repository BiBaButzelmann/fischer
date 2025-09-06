import { buildGameViewUrl } from "@/lib/navigation";
import { Wrench } from "lucide-react";
import { UpcomingEvent, EventIcon } from "./upcoming-event";
import { getSetupHelperNamesByMatchdayId } from "@/db/repositories/setup-helper";
import { getFullName } from "@/lib/participant";

type Props = {
  tournamentId: number;
  matchdayId: number;
  profileId: number;
  start: Date;
};

export async function UpcomingSetupHelperEvent({
  tournamentId,
  matchdayId,
  profileId,
  start,
}: Props) {
  const setupHelpers = await getSetupHelperNamesByMatchdayId(matchdayId);
  const otherSetupHelpers = setupHelpers.filter(
    (helper) => helper.profileId !== profileId,
  );

  const setupHelperNames = otherSetupHelpers.map((helper) =>
    getFullName(helper.firstName, helper.lastName),
  );

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
      additionalInfo={
        <span className="text-gray-500 text-sm">
          mit {setupHelperNames.join(", ")}
        </span>
      }
    />
  );
}
