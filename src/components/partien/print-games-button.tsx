import { Button } from "@/components/ui/button";
import Link from "next/link";
import { buildGameViewParams } from "@/lib/navigation";
import { Printer } from "lucide-react";

type Props = {
  tournamentId: number;
  groupId?: number;
  round?: number;
  participantId?: number;
  matchdayId?: number;
};

export function PrintGamesButton({
  tournamentId,
  groupId,
  round,
  participantId,
  matchdayId,
}: Props) {
  const queryData = {
    tournamentId,
    groupId,
    round,
    participantId,
    matchdayId,
  };

  return (
    <Button variant="outline" asChild title="Paarungen drucken">
      <Link
        href={`/partien/drucken?${buildGameViewParams(queryData)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Printer />
      </Link>
    </Button>
  );
}
