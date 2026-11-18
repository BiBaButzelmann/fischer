import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { matchDays } from "@/constants/constants";
import { GroupRef } from "@/db/types/group";
import { buildMailtoHref } from "@/lib/mailto";

type Props = {
  group: GroupRef | null;
  memberCount: number;
  memberEmails: string[];
  tournamentName: string;
};

export function GroupHeader({
  group,
  memberCount,
  memberEmails,
  tournamentName,
}: Props) {
  return (
    <div className="flex items-center gap-3 border-b bg-muted px-3 py-2 sm:px-4">
      <p className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 text-sm">
        {group ? (
          <>
            <span className="font-semibold">Gruppe {group.groupName}</span>
            {group.dayOfWeek ? (
              <span className="text-muted-foreground">
                {matchDays[group.dayOfWeek]}
              </span>
            ) : null}
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {memberCount}
            </span>
          </>
        ) : (
          <>
            <span className="font-semibold">Ohne Gruppe</span>
            <span className="text-muted-foreground">
              Angemeldet, aber keiner Gruppe zugeordnet
            </span>
          </>
        )}
      </p>
      {group ? (
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="-my-1 h-8 text-muted-foreground hover:text-foreground"
        >
          <a
            href={buildMailtoHref({
              to: memberEmails,
              subject: `${tournamentName} – Gruppe ${group.groupName}`,
            })}
            aria-label={`Gruppe ${group.groupName} anschreiben`}
          >
            <Mail />
            <span className="hidden sm:inline">Gruppe anschreiben</span>
          </a>
        </Button>
      ) : null}
    </div>
  );
}
