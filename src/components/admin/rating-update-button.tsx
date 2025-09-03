"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState, useTransition } from "react";
import { updateParticipantRatingsFromServer } from "@/actions/participant";
import { toast } from "sonner";
import { ParticipantWithZps } from "@/db/types/participant";

type Props = {
  participants: ParticipantWithZps[];
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
          const result = await updateParticipantRatingsFromServer(participant);
          if (result.success) {
            successful++;
          } else {
            failed++;
          }
        } catch (error) {
          failed++;
        }
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
