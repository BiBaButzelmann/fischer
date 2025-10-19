"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { GameWithParticipantProfilesAndGroupAndMatchday } from "@/db/types/game";
import { buildPgnFileName } from "@/actions/pgn";
import { isError } from "@/lib/actions";

export type SearchParamsNumbers = {
  tournamentId: number;
  groupId?: number;
  round?: number;
  participantId?: number;
  matchdayId?: number;
};

type Props = {
  games: GameWithParticipantProfilesAndGroupAndMatchday[];
} & SearchParamsNumbers;

export function MassPgnDownloadButton({
  games,
  tournamentId,
  groupId,
  round,
  participantId,
  matchdayId,
}: Props) {
  const [isDownloading, setIsDownloading] = useState(false);
  const hasPgns = useMemo(
    () => games.some((game) => game.pgn?.value?.trim()),
    [games],
  );

  const handleDownload = async () => {
    if (isDownloading || !hasPgns) return;

    setIsDownloading(true);

    try {
      const content = games
        .map((game) => game.pgn?.value?.trim())
        .filter((value): value is string => !!value && value.length > 0)
        .join("\n\n");

      if (!content) {
        toast.error("Keine PGNs verfügbar.");
        return;
      }

      const fileName = await buildPgnFileName({
        tournamentId,
        groupId,
        round,
        participantId,
        matchdayId,
      });

      if (isError(fileName)) {
        toast.error("Fehler beim Erstellen des Dateinamens.");
        return;
      }

      const blob = new Blob([content], { type: "application/x-chess-pgn" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      toast.success("PGNs heruntergeladen.");
    } catch {
      toast.error("Fehler beim Herunterladen der PGNs.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleDownload}
      disabled={!hasPgns || isDownloading}
      title="PGNs herunterladen"
    >
      <Download className="h-4 w-4 md:mr-2" />
      <span className="hidden md:inline">PGNs herunterladen</span>
    </Button>
  );
}
