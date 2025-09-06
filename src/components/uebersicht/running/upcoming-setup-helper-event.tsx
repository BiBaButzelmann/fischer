import { buildGameViewUrl } from "@/lib/navigation";
import { Info, Wrench } from "lucide-react";
import { UpcomingEvent, EventIcon } from "./upcoming-event";
import { getSetupHelperNamesByMatchdayId } from "@/db/repositories/setup-helper";
import { getFullName } from "@/lib/participant";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
          mit{" "}
          <span className="inline-flex gap-1 [&>*:not(:last-child)]:after:content-[',']">
            {otherSetupHelpers.map((s) => (
              <NameDisplay
                key={s.profileId}
                name={getFullName(s.firstName, s.lastName)}
                email={s.email}
                phoneNumber={s.phoneNumber}
              />
            ))}
          </span>
        </span>
      }
    />
  );
}

function NameDisplay({
  name,
  email,
  phoneNumber,
}: {
  name: string;
  email: string;
  phoneNumber: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger>
        <span className="inline-flex items-center gap-1">
          {name}
          <Info className="size-3" />
        </span>
      </TooltipTrigger>
      <TooltipContent className="bg-white shadow-md">
        <div className="flex flex-col">
          <span className="text-gray-500 text-sm">E-Mail: {email}</span>
          <span className="text-gray-500 text-sm">Telefon: {phoneNumber}</span>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
