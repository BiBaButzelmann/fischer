"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { GameWithParticipantProfilesAndGroupAndMatchday } from "@/db/types/game";

type ExportQuery = {
  tournamentId: number;
  groupId?: number;
  round?: number;
  participantId?: number;
  matchdayId?: number;
};

type Props = {
  games: GameWithParticipantProfilesAndGroupAndMatchday[];
  query: ExportQuery;
};

function buildFileName({
  tournamentId,
  groupId,
  round,
  participantId,
  matchdayId,
}: ExportQuery) {
  const parts = ["partien", String(tournamentId)];

  if (groupId) {
    parts.push(`gruppe-${groupId}`);
  }
  if (round) {
    parts.push(`runde-${round}`);
  }
  if (matchdayId) {
    parts.push(`spieltag-${matchdayId}`);
  }
  if (participantId) {
    parts.push(`spieler-${participantId}`);
  }

  return `${parts.join("-")}.pgn`;
}

export function MassPgnDownloadButton({ games, query }: Props) {
  const [isDownloading, setIsDownloading] = useState(false);
  const hasPgns = useMemo(
    () => games.some((game) => game.pgn?.value?.trim()),
    [games],
  );
  const fileName = useMemo(
    () =>
      buildFileName({
        tournamentId: query.tournamentId,
        groupId: query.groupId,
        round: query.round,
        participantId: query.participantId,
        matchdayId: query.matchdayId,
      }),
    [
      query.tournamentId,
      query.groupId,
      query.round,
      query.participantId,
      query.matchdayId,
    ],
  );

  const handleDownload = () => {
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
      <Download className="mr-2 h-4 w-4" />
      PGNs herunterladen
    </Button>
  );
}
