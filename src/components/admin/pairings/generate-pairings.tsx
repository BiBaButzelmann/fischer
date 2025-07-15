"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";
import { rescheduleGames } from "@/actions/game";

export function GeneratePairings({ tournamentId }: { tournamentId: number }) {
  const [isPending, startTransition] = useTransition();

  const handleGeneratePairings = () => {
    startTransition(async () => {
      await rescheduleGames(tournamentId);
    });
  };

  return (
    <Button size="icon" disabled={isPending} onClick={handleGeneratePairings}>
      <RotateCw />
    </Button>
  );
}
