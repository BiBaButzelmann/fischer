import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { buildGameViewParams, tournamentPath } from "@/lib/navigation";

type Props = {
  slug: string;
  hasPgns: boolean;
  groupId?: number;
  round?: number;
  participantId?: number;
  matchdayId?: number;
};

export function MassPgnDownloadButton({ slug, hasPgns, ...params }: Props) {
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

  const query = buildGameViewParams(params).toString();

  return (
    <Button variant="outline" asChild title="PGNs herunterladen">
      <a
        href={tournamentPath(
          slug,
          query ? `/partien/pgn?${query}` : "/partien/pgn",
        )}
        download
      >
        {label}
      </a>
    </Button>
  );
}
