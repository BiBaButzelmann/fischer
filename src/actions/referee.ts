"use server";

import z from "zod";
import { db } from "@/db/client";
import invariant from "tiny-invariant";
import { referee } from "@/db/schema/referee";
import { createRefereeFormSchema } from "@/schema/referee";
import { getProfileByUserId } from "@/db/repositories/profile";
import { getTournamentById } from "@/db/repositories/tournament";
import { auth } from "@/auth/utils";

export async function createReferee(
  tournamentId: number,
  data: z.infer<typeof createRefereeFormSchema>,
) {
  const session = await auth();

  const tournament = await getTournamentById(tournamentId);
  invariant(tournament, "Tournament not found");

  const currentProfile = await getProfileByUserId(session.user.id);
  invariant(currentProfile, "Profile not found");

  await db.insert(referee).values({
    profileId: currentProfile.id,
    tournamentId: tournament.id,
    preferredMatchDay: data.preferredMatchDay,
    secondaryMatchDays: data.secondaryMatchDays,
  });
}
