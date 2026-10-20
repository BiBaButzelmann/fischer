import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { buildGameViewUrl, type GameViewFilters } from "@/lib/navigation";

type Props = { slug: string; hasPgns: boolean } & GameViewFilters;

export function MassPgnDownloadButton({ hasPgns, ...params }: Props) {
  const label = (
    <>
      <Download className="h-4 w-4 md:mr-2" />
      <span className="hidden md:inline">PGNs herunterladen</span>
    </>
  );

  if (!hasPgns) {
    return (
      <Button variant="outline" disabled title="PGNs herunterladen">
        {label}
      </Button>
    );
  }

  return (
    <Button variant="outline" asChild title="PGNs herunterladen">
      <a href={buildGameViewUrl(params, "/pgn")} download>
        {label}
      </a>
    </Button>
  );
}
