"use client";

import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ParticipantWithName } from "@/db/types/participant";
import { Crown } from "lucide-react";
import { UserWeekdayDisplay } from "../user-weekday-display";
import { formatTwz } from "@/lib/twz";

export function ParticipantEntry({
  participant,
  promotionTarget,
  showMatchDays = true,
  showRating = true,
}: {
  participant: ParticipantWithName;
  promotionTarget?: string;
  showMatchDays?: boolean;
  showRating?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 py-1">
      {promotionTarget ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Crown className="h-4 w-4 shrink-0 text-amber-500" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Aufstiegsrecht in Gruppe {promotionTarget}</p>
          </TooltipContent>
        </Tooltip>
      ) : null}
      <p className="font-semibold flex-grow truncate">
        {participant.profile.firstName} {participant.profile.lastName}
      </p>
      {showMatchDays && (
        <UserWeekdayDisplay
          preferredMatchDay={participant.preferredMatchDay}
          secondaryMatchDays={participant.secondaryMatchDays}
        />
      )}
      {showRating && (
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              // verhindert, dass der Klick auf die Zahl einen Drag startet
              onPointerDown={(e) => e.stopPropagation()}
              className="shrink-0 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Badge
                variant="outline"
                className="w-[72px] cursor-pointer justify-center whitespace-nowrap tabular-nums"
              >
                TWZ {formatTwz(participant)}
              </Badge>
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-auto min-w-[8rem] p-3">
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Wertungen
            </p>
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex items-center justify-between gap-6">
                <span className="text-muted-foreground">FIDE</span>
                <span className="font-medium tabular-nums">
                  {participant.fideRating ?? "–"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span className="text-muted-foreground">DWZ</span>
                <span className="font-medium tabular-nums">
                  {participant.dwzRating ?? "–"}
                </span>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
