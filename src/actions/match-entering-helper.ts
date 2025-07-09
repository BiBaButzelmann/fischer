"use server";

import z from "zod";
import { db } from "@/db/client";
import invariant from "tiny-invariant";
import { matchEnteringHelper } from "@/db/schema/matchEnteringHelper";
import { matchEnteringHelperFormSchema } from "@/schema/matchEnteringHelper";
import { authWithRedirect } from "@/auth/utils";
import { getTournamentById } from "@/db/repositories/tournament";
import { getProfileByUserId } from "@/db/repositories/profile";
import { and, eq } from "drizzle-orm";

export async function createMatchEnteringHelper(
  tournamentId: number,
  data: z.infer<typeof matchEnteringHelperFormSchema>,
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
    .insert(matchEnteringHelper)
    .values({
      profileId: currentProfile.id,
      tournamentId: tournament.id,
      numberOfGroupsToEnter: data.numberOfGroupsToEnter,
    })
    .onConflictDoUpdate({
      target: [matchEnteringHelper.tournamentId, matchEnteringHelper.profileId],
      set: {
        numberOfGroupsToEnter: data.numberOfGroupsToEnter,
      },
    });
}
export async function deleteMatchEnteringHelper(
  tournamentId: number,
  matchEnteringHelperId: number,
) {
  const session = await authWithRedirect();

  const tournament = await getTournamentById(tournamentId);
  invariant(
    tournament != null && tournament.stage === "registration",
    "Tournament not found or not in registration stage",
  );

  const currentProfile = await getProfileByUserId(session.user.id);
  invariant(currentProfile, "Match Entering Helper not found");

  await db
    .delete(matchEnteringHelper)
    .where(
      and(
        eq(matchEnteringHelper.id, matchEnteringHelperId),
        eq(matchEnteringHelper.profileId, currentProfile.id),
        eq(matchEnteringHelper.tournamentId, tournament.id),
      ),
    );
}
