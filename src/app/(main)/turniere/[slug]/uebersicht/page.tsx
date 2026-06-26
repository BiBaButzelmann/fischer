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
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ groupId?: string; round?: string }>;
}) {
  const { slug } = await params;
  const { groupId, round } = await searchParams;
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
    return <TournamentRunning tournament={tournament} />;
  }

  if (tournament.stage === "done") {
    return (
      <TournamentDone
        tournament={tournament}
        selectedGroupId={groupId}
        selectedRound={round}
      />
    );
  }
}
