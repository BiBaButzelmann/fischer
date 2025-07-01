"use server";

import { db } from "@/db/client";
import invariant from "tiny-invariant";
import { juror } from "@/db/schema/juror";
import { auth } from "@/auth/utils";
import { getTournamentById } from "@/db/repositories/tournament";
import { getProfileByUserId } from "@/db/repositories/profile";
import { and, eq } from "drizzle-orm";

export async function createJuror(tournamentId: number) {
  const session = await auth();

  const tournament = await getTournamentById(tournamentId);
  invariant(tournament, "Tournament not found");

  const currentProfile = await getProfileByUserId(session.user.id);
  invariant(currentProfile, "Profile not found");

  await db
    .insert(juror)
    .values({
      profileId: currentProfile.id,
      tournamentId: tournament.id,
    })
    .onConflictDoNothing();
}

export async function deleteJuror(jurorId: number) {
  const session = await auth();

  const currentProfile = await getProfileByUserId(session.user.id);
  invariant(currentProfile, "Juror not found");

  await db
    .delete(juror)
    .where(and(eq(juror.id, jurorId), eq(juror.profileId, currentProfile.id)));
}
