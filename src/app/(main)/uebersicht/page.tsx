import { auth } from "@/auth/utils";
import { TournamentDone } from "@/components/uebersicht/tournament-done";
import { TournamentRegistration } from "@/components/uebersicht/tournament-registration";
import { TournamentRunning } from "@/components/uebersicht/tournament-running";
import { getRolesByUserId } from "@/db/repositories/role";
import { getLatestTournament } from "@/db/repositories/tournament";
import React from "react";

import { redirect } from "next/navigation";

export default async function Page() {
  const tournament = await getLatestTournament();
  const session = await auth();

  if (tournament == null) {
    return (
      <p className="mt-2 text-lg text-muted-foreground">
        Aktuell ist kein Turnier verfügbar.
      </p>
    );
  }

  if (session) {
    const rolesData = await getRolesByUserId(session.user.id);
    if (rolesData.length === 0 && tournament.stage === "registration") {
      redirect("/klubturnier-anmeldung");
    }
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
