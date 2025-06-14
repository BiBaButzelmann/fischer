"use server";

import z from "zod";
import { registerFormSchema } from "./schema";
import { db } from "@/db/client";
import invariant from "tiny-invariant";
import { profile } from "@/db/schema/profile";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { participant } from "@/db/schema/participant";

export async function participateInTournament(
  tournamentId: number,
  data: z.infer<typeof registerFormSchema>,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  invariant(session, "You must be logged in to participate in a tournament");

  const tournament = await db.query.tournament.findFirst({
    where: (tournament, { eq }) => eq(tournament.id, tournamentId),
  });
  invariant(tournament, "Tournament not found");

  const participantProfile = await db
    .update(profile)
    .set({
      phoneNumber: data.phoneNumber,
    })
    .where(eq(profile.userId, session.user.id))
    .returning({
      id: profile.id,
    });

  // TODO: update schema
  await db.insert(participant).values({
    profileId: participantProfile[0].id,
    tournamentId: tournament.id,
    dwzRating: data.dwzRating,
    fideRating: data.fideRating,
    fideId: data.fideId,
  });
}
