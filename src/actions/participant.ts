"use server";

import z from "zod";
import { db } from "@/db/client";
import invariant from "tiny-invariant";
import { participant } from "@/db/schema/participant";
import { participantFormSchema } from "@/schema/participant";
import { authWithRedirect } from "@/auth/utils";
import { getTournamentById } from "@/db/repositories/tournament";
import { getProfileByUserId } from "@/db/repositories/profile";
import { getParticipantsWithDsbPersonIdByTournamentId } from "@/db/repositories/participant";
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
import { getFideProfile } from "@/lib/fide/profile";
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
    "Preferred match day cannot also be a secondary match day",
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
    "Tournament not found or not in registration stage",
  );

  const currentProfile = await getProfileByUserId(session.user.id);
  invariant(currentProfile, "Profile not found");

  const promotionEligibility = await getPromotionEligibility(currentProfile.id);
  const exercisePromotionRight = promotionEligibility
    ? (data.exercisePromotionRight ?? false)
    : null;

  await db
    .insert(participant)
    .values({
      profileId: currentProfile.id,
      tournamentId: tournament.id,
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
    })
    .onConflictDoUpdate({
      target: [participant.tournamentId, participant.profileId],
      set: {
        chessClub,
        gender: data.gender,
        dwzRating: data.dwzRating,
        fideRating: data.fideRating,
        fideId: data.fideId,
        nationality: data.nationality,
        title: data.title === "noTitle" ? null : data.title,
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
      },
    });
});

export async function deleteParticipant(
  tournamentId: number,
  participantId: number,
) {
  const session = await authWithRedirect();

  const tournament = await getTournamentById(tournamentId);
  invariant(tournament != null, "Tournament not found");
  invariant(
    tournament.stage === "registration",
    "Cannot delete participant in this stage",
  );

  const currentProfile = await getProfileByUserId(session.user.id);
  invariant(currentProfile, "Profile not found");

  await db
    .delete(participant)
    .where(
      and(
        eq(participant.id, participantId),
        eq(participant.profileId, currentProfile.id),
        eq(participant.tournamentId, tournament.id),
      ),
    );
}

export async function searchDsbPlayers(
  firstName: string,
  lastName: string,
): Promise<DsbPlayerCandidate[]> {
  await authWithRedirect();

  const persons = await searchDsbPersons(firstName, lastName);
  return persons.map(mapDsbPersonToCandidate);
}

export async function getFideRatingById(
  fideId: string,
): Promise<number | null> {
  await authWithRedirect();

  const fideProfile = await getFideProfile(fideId);
  return fideProfile?.fideRating ?? null;
}

export const updateAllParticipantRatings = action(
  async (
    tournamentId: number,
  ): Promise<{
    updated: number;
    failed: number;
    total: number;
  }> => {
    const session = await authWithRedirect();

    invariant(
      session.user.role === "admin",
      "Unauthorized: Admin access required",
    );

    const participants =
      await getParticipantsWithDsbPersonIdByTournamentId(tournamentId);

    if (participants.length === 0) {
      throw new Error(
        "Keine Teilnehmer mit DSB-Personen-ID zum Aktualisieren vorhanden",
      );
    }

    let updated = 0;
    let failed = 0;

    for (const participantData of participants) {
      try {
        const person = await getDsbPersonById(participantData.dsbPersonId!);

        const fideId =
          participantData.fideId ??
          (person?.fideId != null ? String(person.fideId) : null);

        const values: {
          dwzRating?: number;
          fideRating?: number;
          fideId?: string;
        } = {};

        if (person?.rating != null) {
          values.dwzRating = person.rating;
        }
        if (fideId != null) {
          const profile = await getFideProfile(fideId);
          if (profile?.fideRating != null) {
            values.fideRating = profile.fideRating;
          }
          if (!participantData.fideId) {
            values.fideId = fideId;
          }
        }

        if (Object.keys(values).length === 0) {
          failed++;
          continue;
        }

        await db
          .update(participant)
          .set(values)
          .where(eq(participant.id, participantData.id));

        updated++;
      } catch {
        failed++;
      }
    }

    revalidatePath("/turniere/[slug]/admin/nutzerverwaltung", "page");

    return { updated, failed, total: participants.length };
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
