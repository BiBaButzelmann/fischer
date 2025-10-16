"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { GameWithParticipantProfilesAndGroupAndMatchday } from "@/db/types/game";
import { toLocalDateTime, toDateString } from "@/lib/date";
import { getFullName } from "@/lib/participant";

type ExportQuery = {
  tournamentName: string;
  groupName?: string;
  round?: number;
  participant?: {
    firstName: string;
    lastName: string;
  };
  matchdayDate?: Date;
};

type Props = {
  games: GameWithParticipantProfilesAndGroupAndMatchday[];
  query: ExportQuery;
};

function buildFileName({
  tournamentName,
  groupName,
  round,
  participant,
  matchdayDate,
}: ExportQuery) {
  const parts = [tournamentName.replace(/\s+/g, "_")];

  if (groupName && !participant) {
    parts.push(groupName.replace(/\s+/g, "_"));
  }
  if (round) {
    parts.push(`Runde_${round}`);
  }
  if (matchdayDate) {
    const dateStr = toDateString(toLocalDateTime(matchdayDate)).replace(
      /\./g,
      "_",
    );
    parts.push(dateStr);
  }
  if (participant) {
    const participantName = getFullName(
      participant.firstName,
      participant.lastName,
    );
    parts.push(participantName.replace(/\s+/g, "_"));
  }
  return `${parts.join("_")}.pgn`;
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
        tournamentName: query.tournamentName,
        groupName: query.groupName,
        round: query.round,
        participant: query.participant,
        matchdayDate: query.matchdayDate,
      }),
    [
      query.tournamentName,
      query.groupName,
      query.round,
      query.participant,
      query.matchdayDate,
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
      <Download className="h-4 w-4 md:mr-2" />
      <span className="hidden md:inline">PGNs herunterladen</span>
    </Button>
  );
}
