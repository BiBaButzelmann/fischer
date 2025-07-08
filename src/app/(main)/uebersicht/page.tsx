import { TournamentDone } from "@/components/uebersicht/tournament-done";
import { TournamentRegistration } from "@/components/uebersicht/tournament-registration";
import { TournamentRunning } from "@/components/uebersicht/tournament-running";
import { getLatestTournament } from "@/db/repositories/tournament";
import React from "react";

export default async function Page() {
  const tournament = await getLatestTournament();

  if (tournament == null) {
    return (
      <p className="mt-2 text-lg text-muted-foreground">
        Aktuell ist kein Turnier verfügbar.
      </p>
    );
  }

  if (tournament.stage === "registration") {
    return <TournamentRegistration tournament={tournament} />;
  }

  if (tournament.stage === "running") {
    return <TournamentRunning tournament={tournament} />;
  }

  if (tournament.stage === "done") {
    return <TournamentDone />;
  }
}
