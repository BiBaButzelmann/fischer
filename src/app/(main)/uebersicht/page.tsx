import { auth } from "@/auth/utils";
import { TournamentDone } from "@/components/uebersicht/tournament-done";
import { TournamentRegistration } from "@/components/uebersicht/tournament-registration";
import { TournamentRunning } from "@/components/uebersicht/tournament-running";
import { getRolesDataByProfileIdAndTournamentId } from "@/db/repositories/role";
import { getLatestTournament } from "@/db/repositories/tournament";
import { getProfileByUserId } from "@/db/repositories/profile";
import React from "react";
import invariant from "tiny-invariant";
import { redirect } from "next/navigation";
import { hasSelectedAtLeastOneRole } from "@/db/types/role";

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
    const profile = await getProfileByUserId(session.user.id);
    if (!profile) {
      invariant(profile, "Profile not found");
    }
    const rolesData = await getRolesDataByProfileIdAndTournamentId(
      profile.id,
      tournament.id,
    );
    // the user cannot acces the overview page without selecting at least one role
    if (!hasSelectedAtLeastOneRole(rolesData)) {
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
