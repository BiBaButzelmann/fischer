"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import invariant from "tiny-invariant";
import { buildGameViewUrl, type GameViewFilters } from "@/lib/navigation";

type Props = { slug: string; hasPgns: boolean } & GameViewFilters;

export function MassPgnDownloadButton({ hasPgns, ...params }: Props) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      const response = await fetch(buildGameViewUrl(params, "/pgn"));
      if (!response.ok) {
        toast.error("Fehler beim Herunterladen der PGNs.");
        return;
      }

      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = getFileName(response);
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

function getFileName(response: Response): string {
  const match = response.headers
    .get("Content-Disposition")
    ?.match(/filename\*=UTF-8''([^;]+)/);
  invariant(match, "Response must contain a file name");
  return decodeURIComponent(match[1]);
}
