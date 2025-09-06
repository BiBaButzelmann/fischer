"use server";

import z from "zod";
import { db } from "@/db/client";
import invariant from "tiny-invariant";
import { setupHelperFormSchema } from "@/schema/setupHelper";
import { setupHelper } from "@/db/schema/setupHelper";
import { getProfileByUserId } from "@/db/repositories/profile";
import { getTournamentById } from "@/db/repositories/tournament";
import { authWithRedirect } from "@/auth/utils";
import { and, eq } from "drizzle-orm";

export async function createSetupHelper(
  tournamentId: number,
  data: z.infer<typeof setupHelperFormSchema>,
) {
  const session = await authWithRedirect();

  const tournament = await getTournamentById(tournamentId);
  invariant(
    tournament != null && tournament.stage === "registration",
    "Tournament not found or not in registration stage",
  );

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
export async function deleteSetupHelper(
  tournamentId: number,
  setupHelperId: number,
) {
  const session = await authWithRedirect();

  const tournament = await getTournamentById(tournamentId);
  invariant(tournament != null, "Tournament not found");
  invariant(
    tournament.stage === "registration",
    "Cannot delete setup helper in this stage",
  );

  const currentProfile = await getProfileByUserId(session.user.id);
  invariant(currentProfile, "Profile not found");

  await db
    .delete(setupHelper)
    .where(
      and(
        eq(setupHelper.id, setupHelperId),
        eq(setupHelper.profileId, currentProfile.id),
        eq(setupHelper.tournamentId, tournament.id),
      ),
    );
}
