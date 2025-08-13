"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { savePGN } from "@/actions/pgn";
import { toast } from "sonner";

export default function SavePGNButton({
  newValue,
  gameId,
}: {
  newValue: string;
  gameId: number;
}) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const result = await savePGN(newValue, gameId);

      if (result?.error) {
        toast.error("Nicht für Speichern autorisiert");
      } else {
        toast.success("Partie erfolgreich gespeichert");
      }
    });
  };

  return (
    <Button onClick={handleClick} disabled={isPending} className="w-full mt-4">
      {isPending ? "Saving…" : "Save PGN"}
    </Button>
  );
}
