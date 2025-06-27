"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { savePGN } from "@/actions/pgn";

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
      await savePGN(newValue, gameId);
    });
  };

  return (
    <Button onClick={handleClick} disabled={isPending} className="w-full mt-4">
      {isPending ? "Saving…" : "Save PGN"}
    </Button>
  );
}
