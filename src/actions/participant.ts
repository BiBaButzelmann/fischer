"use server";

import { db } from "@/db/client";
import invariant from "tiny-invariant";
import { participant } from "@/db/schema/participant";
import type { ParticipantFormValues } from "@/schema/participant";
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
import { action, ActionError } from "@/lib/actions";
import { hasSecondaryMatchDayConflict } from "@/lib/match-days";
import { parseDateOnly } from "@/lib/date";
import { getDsbPersonById, searchDsbPersons } from "@/lib/dsb/wertungsportal";
import { mapDsbPersonToCandidate } from "@/lib/dsb/candidate";
import {
  mergeDsbRatings,
  pickRatings,
  type Ratings,
  type RatingSync,
} from "@/lib/dsb/ratings";
import type { DsbPlayerCandidate } from "@/lib/dsb/types";
import type { Participant } from "@/db/types/participant";

export const createParticipant = action(async (
  tournamentId: number,
  data: ParticipantFormValues,
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
      throw new ActionError("Schachverein ist erforderlich");
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
    title: data.title ?? null,
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

export const updateParticipantFromDsb = action(async (participantId: number) => {
  const session = await authWithRedirect();

  invariant(
    session.user.role === "admin",
    "Unauthorized: Admin access required",
  );

  const stored = await getParticipantRatingFieldsById(participantId);
  invariant(stored != null, `Participant ${participantId} not found`);
  invariant(
    stored.dsbPersonId != null,
    `Participant ${participantId} has no DSB person id`,
  );

  return await syncDsbRatings(stored, stored.dsbPersonId);
});

export const linkParticipantDsb = action(
  async (participantId: number, nuLigaPersonId: string) => {
    const session = await authWithRedirect();

    invariant(
      session.user.role === "admin",
      "Unauthorized: Admin access required",
    );

    const stored = await getParticipantRatingFieldsById(participantId);
    invariant(stored != null, `Participant ${participantId} not found`);

    const result = await syncDsbRatings(stored, nuLigaPersonId);

    revalidatePath("/turniere/[slug]/admin/nutzerverwaltung", "page");
    return result;
  },
);

async function syncDsbRatings(
  stored: Ratings & Pick<Participant, "id">,
  nuLigaPersonId: string,
) {
  const person = await getDsbPersonById(nuLigaPersonId);
  if (person == null) {
    return { status: "dsbNotFound" } as const;
  }

  const sync: RatingSync = {
    previous: pickRatings(stored),
    dsb: pickRatings(mapDsbPersonToCandidate(person)),
  };
  await db
    .update(participant)
    .set({
      ...mergeDsbRatings(sync),
      dsbPersonId: person.nuLigaPersonId,
      updatedAt: new Date(),
    })
    .where(eq(participant.id, stored.id));
  return { status: "synced", ...sync } as const;
}

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
