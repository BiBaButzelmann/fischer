import { auth } from "@/auth/utils";
import { TournamentDone } from "@/components/uebersicht/tournament-done";
import { TournamentRegistration } from "@/components/uebersicht/registration/tournament-registration";
import { TournamentRunning } from "@/components/uebersicht/running/tournament-running";
import { getRolesByUserId } from "@/db/repositories/role";
import { getTournamentBySlug } from "@/db/repositories/tournament";
import React from "react";

import { notFound, redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tournament = await getTournamentBySlug(slug);
  const session = await auth();

  if (tournament == null) {
    notFound();
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
    return <TournamentRunning tournamentId={tournament.id} slug={slug} />;
  }

  if (tournament.stage === "done") {
    return <TournamentDone />;
  }
}
