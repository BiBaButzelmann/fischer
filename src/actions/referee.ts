"use server";

import z from "zod";
import { db } from "@/db/client";
import invariant from "tiny-invariant";
import { referee } from "@/db/schema/referee";
import { refereeFormSchema } from "@/schema/referee";
import { getProfileByUserId } from "@/db/repositories/profile";
import { getTournamentById } from "@/db/repositories/tournament";
import { authWithRedirect } from "@/auth/utils";
import { and, eq } from "drizzle-orm";

export async function createReferee(
  tournamentId: number,
  data: z.infer<typeof refereeFormSchema>,
) {
  const session = await authWithRedirect();

  const tournament = await getTournamentById(tournamentId);
  invariant(tournament != null, "Tournament not found");

  const currentProfile = await getProfileByUserId(session.user.id);
  invariant(currentProfile, "Profile not found");

  await db
    .insert(referee)
    .values({
      profileId: currentProfile.id,
      tournamentId: tournament.id,
      preferredMatchDay: data.preferredMatchDay,
      secondaryMatchDays: data.secondaryMatchDays,
      fideId: data.fideId,
    })
    .onConflictDoUpdate({
      target: [referee.tournamentId, referee.profileId],
      set: {
        preferredMatchDay: data.preferredMatchDay,
        secondaryMatchDays: data.secondaryMatchDays,
        fideId: data.fideId,
      },
    });
}

export async function deleteReferee(tournamentId: number, refereeId: number) {
  const session = await authWithRedirect();

  const tournament = await getTournamentById(tournamentId);
  invariant(tournament != null, "Tournament not found");

  const currentProfile = await getProfileByUserId(session.user.id);
  invariant(currentProfile, "Profile not found");

  await db
    .delete(referee)
    .where(
      and(
        eq(referee.id, refereeId),
        eq(referee.profileId, currentProfile.id),
        eq(referee.tournamentId, tournament.id),
      ),
    );
}
