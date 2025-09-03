"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState, useTransition } from "react";
import { updateParticipantRatingsFromServer } from "@/actions/participant";
import { toast } from "sonner";

type Props = {
  participants: Array<{
    id: number;
    profile: {
      firstName: string;
      lastName: string;
    };
  }>;
};

export function RatingUpdateButton({ participants }: Props) {
  const [isPending, startTransition] = useTransition();
  const [updateProgress, setUpdateProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  const handleUpdateRatings = () => {
    startTransition(async () => {
      const total = participants.length;
      let successful = 0;
      let failed = 0;

      setUpdateProgress({ current: 0, total });

      for (let i = 0; i < participants.length; i++) {
        const participant = participants[i];
        setUpdateProgress({ current: i + 1, total });

        try {
          console.log(
            `Updating participant ${participant.id}: ${participant.profile.firstName} ${participant.profile.lastName}`,
          );
          const result = await updateParticipantRatingsFromServer(
            participant.id,
          );

          console.log(
            `Update result for participant ${participant.id}:`,
            result,
          );

          if (result.success) {
            successful++;
          } else {
            failed++;
            console.warn(
              `Failed to update ${participant.profile.firstName} ${participant.profile.lastName}: ${result.message}`,
            );
          }
        } catch (error) {
          failed++;
          console.error(
            `Error updating ${participant.profile.firstName} ${participant.profile.lastName}:`,
            error,
          );
        }

        // Small delay to prevent overwhelming the server
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      setUpdateProgress(null);

      if (successful > 0) {
        toast.success(
          `${successful} Wertungszahlen erfolgreich aktualisiert${failed > 0 ? `, ${failed} fehlgeschlagen` : ""}`,
        );
      } else if (failed > 0) {
        toast.error(`Alle ${failed} Aktualisierungen fehlgeschlagen`);
      }
    });
  };

  return (
    <Button
      onClick={handleUpdateRatings}
      disabled={isPending}
      variant="outline"
      className="flex items-center gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
      {isPending
        ? updateProgress
          ? `Aktualisiere ${updateProgress.current}/${updateProgress.total}...`
          : "Wird aktualisiert..."
        : "Ratings aktualisieren"}
    </Button>
  );
}
