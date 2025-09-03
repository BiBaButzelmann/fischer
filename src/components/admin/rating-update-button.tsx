"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useTransition } from "react";
import { updateAllParticipantRatings } from "@/actions/participant";
import { toast } from "sonner";
import { isError } from "@/lib/actions";

type RatingUpdateParticipant = {
  id: number;
  zpsPlayerId: string | null;
};

type Props = {
  participants: RatingUpdateParticipant[];
};

export function RatingUpdateButton({ participants }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleUpdateRatings = () => {
    startTransition(async () => {
      const result = await updateAllParticipantRatings(participants);

      if (isError(result)) {
        toast.error(result.error);
        return;
      }

      if (result.successful > 0) {
        toast.success(
          `${result.successful} Wertungszahlen erfolgreich aktualisiert${
            result.failed > 0 ? `, ${result.failed} fehlgeschlagen` : ""
          }`,
        );
      } else if (result.failed > 0) {
        toast.error(`Alle ${result.failed} Aktualisierungen fehlgeschlagen`);
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
      {isPending ? "Wird aktualisiert..." : "Ratings aktualisieren"}
    </Button>
  );
}
