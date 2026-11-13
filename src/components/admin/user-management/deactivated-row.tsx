"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { restoreUserProfile } from "@/actions/admin";
import { ProfileWithName } from "@/db/types/profile";
import { formatDate, toLocalDateTime } from "@/lib/date";
import { getFullName } from "@/lib/participant";
import { PersonRow } from "./person-row";
import { TournamentRef } from "./types";

type Props = {
  profile: ProfileWithName;
  tournament: TournamentRef;
};

export function DeactivatedRow({ profile, tournament }: Props) {
  const [isPending, startTransition] = useTransition();
  const displayName = getFullName(profile.firstName, profile.lastName);

  const handleRestore = () => {
    startTransition(async () => {
      const result = await restoreUserProfile(profile.userId, tournament.id);
      if (!result.success) {
        toast.error(
          "reason" in result
            ? result.reason
            : "Wiederherstellen fehlgeschlagen.",
        );
        return;
      }
      toast.success(`${displayName} ist wiederhergestellt.`);
    });
  };

  return (
    <PersonRow
      name={displayName}
      muted
      meta={
        profile.deletedAt ? (
          <p>
            Deaktiviert am{" "}
            <span className="font-mono tabular-nums">
              {formatDate(toLocalDateTime(profile.deletedAt))}
            </span>
          </p>
        ) : null
      }
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={handleRestore}
          disabled={isPending}
        >
          {isPending ? "Wird wiederhergestellt …" : "Wiederherstellen"}
        </Button>
      }
    />
  );
}
