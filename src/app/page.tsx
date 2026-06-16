import {
  getActiveTournament,
  getLatestTournament,
} from "@/db/repositories/tournament";
import { tournamentPath } from "@/lib/navigation";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home() {
  const tournament =
    (await getActiveTournament()) ?? (await getLatestTournament());

  if (tournament) {
    redirect(tournamentPath(tournament.slug, "/uebersicht"));
  }

  return (
    <p className="mt-2 text-lg text-muted-foreground">
      Aktuell ist kein Turnier verfügbar.
    </p>
  );
}
