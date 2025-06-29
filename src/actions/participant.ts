"use server";

import z from "zod";
import { db } from "@/db/client";
import invariant from "tiny-invariant";
import { profile } from "@/db/schema/profile";
import { eq } from "drizzle-orm";
import { participant } from "@/db/schema/participant";
import { createParticipantFormSchema } from "@/schema/participant";
import { auth } from "@/auth/utils";
import { getTournamentById } from "@/db/repositories/tournament";

export async function createTournamentParticipant(
  tournamentId: number,
  data: z.infer<typeof createParticipantFormSchema>,
) {
  const session = await auth();

  const tournament = await getTournamentById(tournamentId);
  invariant(tournament, "Tournament not found");

  const currentProfile = await db
    .update(profile)
    .set({
      phoneNumber: data.phoneNumber,
    })
    .where(eq(profile.userId, session.user.id))
    .returning({
      id: profile.id,
    });

  await db
    .insert(participant)
    .values({
      profileId: currentProfile[0].id,
      tournamentId: tournament.id,
      chessClub: data.chessClub,
      dwzRating: data.dwzRating,
      fideRating: data.fideRating,
      fideId: data.fideId,
      preferredMatchDay: data.preferredMatchDay,
      secondaryMatchDays: data.secondaryMatchDays,
    })
    .onConflictDoNothing();
}
