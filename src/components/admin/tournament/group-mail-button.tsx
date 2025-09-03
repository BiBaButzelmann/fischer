"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tournament } from "@/db/types/tournament";
import { sendTournamentStartedEmailsToGroup } from "@/actions/email/tournament-started";
import { useTransition, useState } from "react";
import { Mail, ChevronDown } from "lucide-react";
import { toast } from "sonner";

type Props = {
  tournament: Tournament;
  groups: {
    id: number;
    groupName: string;
  }[];
};

export function GroupMailButton({ tournament, groups }: Props) {
  const [isPending, startTransition] = useTransition();
  const [sentGroups, setSentGroups] = useState<Set<number>>(new Set());
  const isRunning = tournament.stage === "running";

  const handleSendGroupMails = (groupId: number, groupName: string) => {
    startTransition(async () => {
      try {
        const result = await sendTournamentStartedEmailsToGroup(
          tournament.id,
          groupId,
        );
        setSentGroups((prev) => new Set(prev).add(groupId));
        toast.success(
          `E-Mails an ${result.sent} Personen in ${groupName} versendet`,
        );
      } catch {
        toast.error("Fehler beim Versenden der E-Mails");
      }
    });
  };

  if (groups.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          disabled={!isRunning || isPending}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Mail className="h-4 w-4" />
          {isPending ? "Versendet..." : "Gruppe mailen"}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {groups.map((group) => (
          <DropdownMenuItem
            key={group.id}
            onClick={() => handleSendGroupMails(group.id, group.groupName)}
            disabled={isPending || sentGroups.has(group.id)}
            className="flex items-center justify-between"
          >
            <span>{group.groupName}</span>
            {sentGroups.has(group.id) && (
              <span className="text-xs text-green-600 ml-2">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
