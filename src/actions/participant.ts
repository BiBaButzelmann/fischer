"use server";

import z from "zod";
import { db } from "@/db/client";
import invariant from "tiny-invariant";
import { participant } from "@/db/schema/participant";
import { participantFormSchema } from "@/schema/participant";
import { authWithRedirect } from "@/auth/utils";
import { getTournamentById } from "@/db/repositories/tournament";
import { getProfileByUserId } from "@/db/repositories/profile";
import {
  getParticipantByProfileIdAndTournamentId,
  getParticipantRatingFieldsById,
} from "@/db/repositories/participant";
import { participantChangeLog } from "@/db/schema/participantChangeLog";
import { computeParticipantChanges } from "@/lib/activity";
import { getPromotionEligibility } from "@/services/promotion";
import { and, eq } from "drizzle-orm";
import {
  CLUBLESS_KEY,
  CLUBLESS_LABEL,
  DEFAULT_CLUB_KEY,
  DEFAULT_CLUB_LABEL,
} from "@/constants/constants";
import { revalidatePath } from "next/cache";
import { action } from "@/lib/actions";
import { hasSecondaryMatchDayConflict } from "@/lib/match-days";
import { parseDateOnly } from "@/lib/date";
import { getFideProfile, getFideStandardRating } from "@/lib/fide/profile";
import { getDsbPersonById, searchDsbPersons } from "@/lib/dsb/wertungsportal";
import { mapDsbPersonToCandidate } from "@/lib/dsb/candidate";
import type { DsbPlayerCandidate } from "@/lib/dsb/types";

export const createParticipant = action(async (
  tournamentId: number,
  data: z.infer<typeof participantFormSchema>,
) => {
  invariant(
    !hasSecondaryMatchDayConflict(
      data.preferredMatchDay,
      data.secondaryMatchDays,
    ),
    `Preferred match day cannot also be a secondary match day (tournament ${tournamentId})`,
  );

  const session = await authWithRedirect();

  let chessClub: string;
  if (data.chessClubType === "other") {
    if (!data.chessClub || data.chessClub.trim().length === 0) {
      throw new Error("Schachverein ist erforderlich");
    }
    chessClub = data.chessClub;
  } else if (data.chessClubType === CLUBLESS_KEY) {
    chessClub = CLUBLESS_LABEL;
  } else {
    chessClub = DEFAULT_CLUB_LABEL;
  }

  const entryFeePayed = data.chessClubType === DEFAULT_CLUB_KEY ? null : false;
  const birthYear = data.birthDate
    ? parseDateOnly(data.birthDate).year
    : data.birthYear;

  const tournament = await getTournamentById(tournamentId);
  invariant(
    tournament != null && tournament.stage === "registration",
    `Tournament ${tournamentId} not found or not in registration stage`,
  );

  const currentProfile = await getProfileByUserId(session.user.id);
  invariant(currentProfile, `Profile not found for user ${session.user.id}`);

  const promotionEligibility = await getPromotionEligibility(currentProfile.id);
  const exercisePromotionRight = promotionEligibility
    ? (data.exercisePromotionRight ?? false)
    : null;

  const values = {
    chessClub,
    title: data.title === "noTitle" ? null : data.title,
    gender: data.gender,
    dwzRating: data.dwzRating,
    fideRating: data.fideRating,
    fideId: data.fideId,
    nationality: data.nationality,
    birthYear,
    birthDate: data.birthDate,
    preferredMatchDay: data.preferredMatchDay,
    secondaryMatchDays: data.secondaryMatchDays,
    notAvailableDays: data.notAvailableDays,
    dsbPersonId: data.dsbPersonId,
    zpsClubId: data.zpsClub,
    zpsPlayerId: data.zpsPlayer,
    entryFeePayed,
    exercisePromotionRight,
  };

  const existing = await getParticipantByProfileIdAndTournamentId(
    currentProfile.id,
    tournament.id,
  );

  if (existing) {
    const changes = computeParticipantChanges(existing, values);
    if (Object.keys(changes).length === 0) {
      return;
    }

    await db.transaction(async (tx) => {
      await tx
        .update(participant)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(participant.id, existing.id));
      await tx.insert(participantChangeLog).values({
        profileId: currentProfile.id,
        tournamentId: tournament.id,
        changes,
      });
    });
    return;
  }

  await db
    .insert(participant)
    .values({
      profileId: currentProfile.id,
      tournamentId: tournament.id,
      ...values,
    })
    .onConflictDoUpdate({
      target: [participant.tournamentId, participant.profileId],
      set: { ...values, updatedAt: new Date() },
    });
});

export const deleteParticipant = action(async (
  tournamentId: number,
  participantId: number,
) => {
  const session = await authWithRedirect();

  const tournament = await getTournamentById(tournamentId);
  invariant(tournament != null, `Tournament ${tournamentId} not found`);
  invariant(
    tournament.stage === "registration",
    `Cannot delete participant ${participantId} in tournament ${tournamentId} (stage ${tournament.stage})`,
  );

  const currentProfile = await getProfileByUserId(session.user.id);
  invariant(currentProfile, `Profile not found for user ${session.user.id}`);

  await db
    .delete(participant)
    .where(
      and(
        eq(participant.id, participantId),
        eq(participant.profileId, currentProfile.id),
        eq(participant.tournamentId, tournament.id),
      ),
    );
});

export async function searchDsbPlayers(
  firstName: string,
  lastName: string,
  vkz?: string | null,
): Promise<DsbPlayerCandidate[]> {
  await authWithRedirect();

  const persons = await searchDsbPersons(firstName, lastName, vkz);
  return persons.map(mapDsbPersonToCandidate);
}

export async function getFideRatingById(
  fideId: string,
): Promise<number | null> {
  await authWithRedirect();

  return await getFideStandardRating(fideId);
}

export const updateParticipantFromDsb = action(async (participantId: number) => {
  const session = await authWithRedirect();

  invariant(
    session.user.role === "admin",
    "Unauthorized: Admin access required",
  );

  const current = await getParticipantRatingFieldsById(participantId);
  invariant(current != null, `Participant ${participantId} not found`);
  invariant(
    current.dsbPersonId != null,
    `Participant ${participantId} has no DSB person id`,
  );

  const person = await getDsbPersonById(current.dsbPersonId);
  if (person == null) {
    return { status: "dsbNotFound" } as const;
  }

  const values: { dwzRating?: number; fideId?: string } = {};
  if (person.rating != null) {
    values.dwzRating = person.rating;
  }
  if (!current.fideId && person.fideId != null) {
    values.fideId = String(person.fideId);
  }

  if (Object.keys(values).length === 0) {
    return { status: "noRating" } as const;
  }

  await db
    .update(participant)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(participant.id, participantId));

  return {
    status: "updated",
    previousDwzRating: current.dwzRating,
    dwzRating: values.dwzRating ?? current.dwzRating,
    fideId: values.fideId ?? current.fideId,
  } as const;
});

export const updateParticipantFide = action(async (participantId: number) => {
  const session = await authWithRedirect();

  invariant(
    session.user.role === "admin",
    "Unauthorized: Admin access required",
  );

  const current = await getParticipantRatingFieldsById(participantId);
  invariant(current != null, `Participant ${participantId} not found`);

  if (!current.fideId) {
    return { status: "noFideId" } as const;
  }

  const lookup = await getFideProfile(current.fideId);
  if (lookup.status !== "found") {
    return { status: lookup.status } as const;
  }
  if (lookup.profile.fideRating == null) {
    return { status: "noRating" } as const;
  }

  await db
    .update(participant)
    .set({ fideRating: lookup.profile.fideRating, updatedAt: new Date() })
    .where(eq(participant.id, participantId));

  return {
    status: "updated",
    previousFideRating: current.fideRating,
    fideRating: lookup.profile.fideRating,
  } as const;
});

export const linkParticipantDsb = action(
  async (participantId: number, nuLigaPersonId: string) => {
    const session = await authWithRedirect();

    invariant(
      session.user.role === "admin",
      "Unauthorized: Admin access required",
    );

    const current = await getParticipantRatingFieldsById(participantId);
    invariant(current != null, `Participant ${participantId} not found`);

    const person = await getDsbPersonById(nuLigaPersonId);
    if (person == null) {
      throw new Error("DSB-Person nicht gefunden");
    }

    await db
      .update(participant)
      .set({
        dsbPersonId: person.nuLigaPersonId,
        fideId: person.fideId != null ? String(person.fideId) : current.fideId,
        updatedAt: new Date(),
      })
      .where(eq(participant.id, participantId));

    revalidatePath("/turniere/[slug]/admin/nutzerverwaltung", "page");
  },
);

export async function updateEntryFeeStatus(
  participantId: number,
  entryFeePayed: boolean,
) {
  const session = await authWithRedirect();

  invariant(
    session.user.role === "admin",
    "Unauthorized: Admin access required",
  );

  await db
    .update(participant)
    .set({
      entryFeePayed,
    })
    .where(eq(participant.id, participantId));

  revalidatePath("/turniere/[slug]/admin/startgeld", "page");
}
