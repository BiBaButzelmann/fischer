"use client";

import { Button } from "@/components/ui/button";
import { GroupWithGames } from "@/db/types/group";
import { useTransition } from "react";
import { scheduleGames } from "./actions/games";

// TODO: find better name
export function Pairing({ groups }: { groups: GroupWithGames[] }) {
  const [isPending, startTransition] = useTransition();

  const handleGenerateGames = () => {
    startTransition(async () => {
      await scheduleGames(1); // Replace with actual tournament ID
    });
  };

  if (!hasGamesScheduled(groups)) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-4">
        <span>Keine Partien angesetzt</span>
        <Button onClick={handleGenerateGames} disabled={isPending}>
          Partien generieren
        </Button>
      </div>
    );
  }

  return <div>yee</div>;
}

function hasGamesScheduled(groups: GroupWithGames[]) {
  return groups.every((group) => group.games.length > 0);
}
