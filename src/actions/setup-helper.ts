"use server";

import z from "zod";
import { db } from "@/db/client";
import invariant from "tiny-invariant";
import { setupHelperFormSchema } from "@/schema/setupHelper";
import { setupHelper } from "@/db/schema/setupHelper";
import { getProfileByUserId } from "@/db/repositories/profile";
import { getTournamentById } from "@/db/repositories/tournament";
import { auth } from "@/auth/utils";

export async function createSetupHelper(
  tournamentId: number,
  data: z.infer<typeof setupHelperFormSchema>,
) {
  const session = await auth();

  const tournament = await getTournamentById(tournamentId);
  invariant(tournament, "Tournament not found");

  const currentProfile = await getProfileByUserId(session.user.id);
  invariant(currentProfile, "Profile not found");

  await db
    .insert(setupHelper)
    .values({
      profileId: currentProfile.id,
      tournamentId: tournament.id,
      preferredMatchDay: data.preferredMatchDay,
      secondaryMatchDays: data.secondaryMatchDays,
    })
    .onConflictDoUpdate({
      target: [setupHelper.tournamentId, setupHelper.profileId],
      set: {
        preferredMatchDay: data.preferredMatchDay,
        secondaryMatchDays: data.secondaryMatchDays,
      },
    });
}
