import { Button } from "@/components/ui/button";
import Link from "next/link";
import { buildGameViewUrl, type GameViewFilters } from "@/lib/navigation";
import { Printer } from "lucide-react";

type Props = { slug: string } & GameViewFilters;

export function PrintGamesButton(props: Props) {
  return (
    <Button variant="outline" asChild title="Paarungen drucken">
      <Link
        href={buildGameViewUrl(props, "/drucken")}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Printer />
      </Link>
    </Button>
  );
}
