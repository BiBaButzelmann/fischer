"use server";

import { db } from "@/db/client";
import invariant from "tiny-invariant";
import { juror } from "@/db/schema/juror";
import { auth } from "@/auth/utils";
import { getTournamentById } from "@/db/repositories/tournament";
import { getProfileByUserId } from "@/db/repositories/profile";

export async function createJuror(tournamentId: number) {
  const session = await auth();

  const tournament = await getTournamentById(tournamentId);
  invariant(tournament, "Tournament not found");

  const currentProfile = await getProfileByUserId(session.user.id);
  invariant(currentProfile, "Profile not found");

  await db.insert(juror).values({
    profileId: currentProfile.id,
    tournamentId: tournament.id,
  });
}
