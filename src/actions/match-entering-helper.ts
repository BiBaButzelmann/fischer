"use server";

import z from "zod";
import { db } from "@/db/client";
import invariant from "tiny-invariant";
import { matchEnteringHelper } from "@/db/schema/matchEnteringHelper";
import { matchEnteringHelperFormSchema } from "@/schema/matchEnteringHelper";
import { auth } from "@/auth/utils";
import { getTournamentById } from "@/db/repositories/tournament";
import { getProfileByUserId } from "@/db/repositories/profile";
import { and, eq } from "drizzle-orm";

export async function createMatchEnteringHelper(
  tournamentId: number,
  data: z.infer<typeof matchEnteringHelperFormSchema>,
) {
  const session = await auth();

  const tournament = await getTournamentById(tournamentId);
  invariant(tournament, "Tournament not found");

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
export async function deleteMatchEnteringHelper(matchEnteringHelperId: number) {
  const session = await auth();

  const currentProfile = await getProfileByUserId(session.user.id);
  invariant(currentProfile, "Profile not found");

  await db
    .delete(matchEnteringHelper)
    .where(
      and(
        eq(matchEnteringHelper.id, matchEnteringHelperId),
        eq(matchEnteringHelper.profileId, currentProfile.id),
      ),
    );
}
