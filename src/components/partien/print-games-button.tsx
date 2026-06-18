import { Button } from "@/components/ui/button";
import Link from "next/link";
import { buildGameViewParams, tournamentPath } from "@/lib/navigation";
import { Printer } from "lucide-react";

type Props = {
  slug: string;
  groupId?: number;
  round?: number;
  participantId?: number;
  matchdayId?: number;
};

export function PrintGamesButton({ slug, ...params }: Props) {
  const query = buildGameViewParams(params).toString();

  return (
    <Button variant="outline" asChild title="Paarungen drucken">
      <Link
        href={tournamentPath(
          slug,
          query ? `/partien/drucken?${query}` : "/partien/drucken",
        )}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Printer />
      </Link>
    </Button>
  );
}
