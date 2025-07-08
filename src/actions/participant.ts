"use server";

import z from "zod";
import { db } from "@/db/client";
import invariant from "tiny-invariant";
import { participant } from "@/db/schema/participant";
import { participantFormSchema } from "@/schema/participant";
import { authWithRedirect } from "@/auth/utils";
import { getTournamentById } from "@/db/repositories/tournament";
import { getProfileByUserId } from "@/db/repositories/profile";
import { and, eq } from "drizzle-orm";

export async function createParticipant(
  tournamentId: number,
  data: z.infer<typeof participantFormSchema>,
) {
  const session = await authWithRedirect();

  const tournament = await getTournamentById(tournamentId);
  invariant(tournament, "Tournament not found");

  const currentProfile = await getProfileByUserId(session.user.id);
  invariant(currentProfile, "Profile not found");

  await db
    .insert(participant)
    .values({
      profileId: currentProfile.id,
      tournamentId: tournament.id,
      chessClub: data.chessClub,
      title: data.title === "noTitle" ? null : data.title,
      dwzRating: data.dwzRating,
      fideRating: data.fideRating,
      fideId: data.fideId,
      preferredMatchDay: data.preferredMatchDay,
      secondaryMatchDays: data.secondaryMatchDays,
    })
    .onConflictDoUpdate({
      target: [participant.tournamentId, participant.profileId],
      set: {
        chessClub: data.chessClub,
        dwzRating: data.dwzRating,
        fideRating: data.fideRating,
        fideId: data.fideId,
        preferredMatchDay: data.preferredMatchDay,
        secondaryMatchDays: data.secondaryMatchDays,
      },
    });
}

export async function deleteParticipant(participantId: number) {
  const session = await authWithRedirect();

  const currentProfile = await getProfileByUserId(session.user.id);
  invariant(currentProfile, "Profile not found");

  await db
    .delete(participant)
    .where(
      and(
        eq(participant.id, participantId),
        eq(participant.profileId, currentProfile.id),
      ),
    );
}
