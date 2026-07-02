"use server";

import z from "zod";
import { db } from "@/db/client";
import invariant from "tiny-invariant";
import { participant } from "@/db/schema/participant";
import { participantFormSchema } from "@/schema/participant";
import { authWithRedirect } from "@/auth/utils";
import { getTournamentById } from "@/db/repositories/tournament";
import { getProfileByUserId } from "@/db/repositories/profile";
import { getParticipantsWithZpsIdsByTournamentId } from "@/db/repositories/participant";
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
import { getFideProfile } from "@/lib/fide/profile";

function parseRating(value: string | undefined): number | null {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }
  const rating = Number(trimmed);
  return Number.isFinite(rating) && rating > 0 ? rating : null;
}

export async function createParticipant(
  tournamentId: number,
  data: z.infer<typeof participantFormSchema>,
) {
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
    ? data.birthDate.getFullYear()
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
        zpsClubId: data.zpsClub,
        zpsPlayerId: data.zpsPlayer,
        entryFeePayed,
        exercisePromotionRight,
      },
    });
}

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

export async function getParticipantEloData(
  firstName: string,
  lastName: string,
): Promise<{
  title: string | null;
  nationality: string;
  fideRating: number | null;
  dwzRating: number | null;
  fideId: string | null;
  zpsClub: string;
  zpsPlayer: string;
  gender: "m" | "f" | null;
  birthYear: number | null;
} | null> {
  await authWithRedirect();

  const clubData = await fetch(
    "https://www.schachbund.de/php/dewis/verein.php?zps=40023&format=csv",
  );
  const clubCsv = await clubData.text();

  const clubCsvLines = clubCsv.split("\n");
  const matchingClubLine = clubCsvLines.find((line) => {
    const fields = line.split("|");
    const rowLastName = fields[1]?.trim() || "";
    const rowFirstName = fields[2]?.trim() || "";

    return (
      rowFirstName.toLowerCase() === firstName.toLowerCase() &&
      rowLastName.toLowerCase() === lastName.toLowerCase()
    );
  });

  if (!matchingClubLine) {
    return null;
  }

  const clubFields = matchingClubLine.split("|");
  if (clubFields.length !== 14) {
    return null;
  }

  const playerId = clubFields[0];
  if (playerId.trim() === "") {
    return null;
  }

  const playerData = await fetch(
    `https://www.schachbund.de/php/dewis/spieler.php?pkz=${playerId}&format=csv`,
  );
  const playerCsv = await playerData.text();

  const playerCsvLines = playerCsv.split("\n");
  const matchingPlayerLine = playerCsvLines[1].replace(/[\n\r\t]/gm, "");

  const playerFields = matchingPlayerLine.split("|");

  if (playerFields.length !== 10) {
    return null;
  }

  const dwzRating = parseRating(playerFields[4]);
  const fideId = playerFields[6] || null;

  const fideProfile = fideId ? await getFideProfile(fideId) : null;

  return {
    title: fideProfile?.title ?? (playerFields[8] || null),
    nationality: playerFields[9],
    fideRating: fideProfile?.fideRating ?? null,
    dwzRating,
    fideId,
    zpsClub: clubFields[4],
    zpsPlayer: clubFields[5],
    gender: fideProfile?.gender ?? null,
    birthYear: fideProfile?.birthYear ?? null,
  };
}

export async function getFideRatingById(
  fideId: string,
): Promise<number | null> {
  await authWithRedirect();

  const fideProfile = await getFideProfile(fideId);
  return fideProfile?.fideRating ?? null;
}

export async function getDwzAndFideIdByZps(
  zpsPlayerId: string,
  zpsClubId: string,
): Promise<{ dwzRating: number | null; fideId: string | null } | null> {
  const clubData = await fetch(
    `https://www.schachbund.de/php/dewis/verein.php?zps=${zpsClubId}&format=csv`,
  );
  const clubCsv = await clubData.text();

  const clubCsvLines = clubCsv.split("\n");
  const matchingClubLine = clubCsvLines.find((line) => {
    const fields = line.split("|");
    const rowZps = fields[5]?.trim() || "";

    return rowZps === zpsPlayerId;
  });
  if (!matchingClubLine) {
    return null;
  }

  const clubFields = matchingClubLine.split("|");
  if (clubFields.length !== 14) {
    return null;
  }

  return {
    dwzRating: parseRating(clubFields[7]),
    fideId: clubFields[11]?.trim() || null,
  };
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
      await getParticipantsWithZpsIdsByTournamentId(tournamentId);

    if (participants.length === 0) {
      throw new Error(
        "Keine Teilnehmer mit ZPS-Player-ID zum Aktualisieren vorhanden",
      );
    }

    let updated = 0;
    let failed = 0;

    for (const participantData of participants) {
      try {
        const dewisData = await getDwzAndFideIdByZps(
          participantData.zpsPlayerId!,
          participantData.zpsClubId!,
        );

        const fideId = participantData.fideId ?? dewisData?.fideId ?? null;

        const values: {
          dwzRating?: number;
          fideRating?: number;
          fideId?: string;
        } = {};

        if (dewisData?.dwzRating != null) {
          values.dwzRating = dewisData.dwzRating;
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
