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
import { DEFAULT_CLUB_LABEL } from "@/constants/constants";
import { revalidatePath } from "next/cache";
import { getParticipantForRatingUpdate } from "@/db/repositories/participant";

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
  } else {
    chessClub = DEFAULT_CLUB_LABEL;
  }

  const tournament = await getTournamentById(tournamentId);
  invariant(tournament != null, "Tournament not found");

  const currentProfile = await getProfileByUserId(session.user.id);
  invariant(currentProfile, "Profile not found");

  await db
    .insert(participant)
    .values({
      profileId: currentProfile.id,
      tournamentId: tournament.id,
      chessClub,
      title: data.title === "noTitle" ? null : data.title,
      dwzRating: data.dwzRating,
      fideRating: data.fideRating,
      fideId: data.fideId,
      nationality: data.nationality,
      birthYear: data.birthYear,
      preferredMatchDay: data.preferredMatchDay,
      secondaryMatchDays: data.secondaryMatchDays,
      notAvailableDays: data.notAvailableDays,
      zpsClubId: data.zpsClub,
      zpsPlayerId: data.zpsPlayer,
      entryFeePayed: data.chessClubType === "other" ? false : null,
    })
    .onConflictDoUpdate({
      target: [participant.tournamentId, participant.profileId],
      set: {
        chessClub,
        dwzRating: data.dwzRating,
        fideRating: data.fideRating,
        fideId: data.fideId,
        nationality: data.nationality,
        title: data.title === "noTitle" ? null : data.title,
        birthYear: data.birthYear,
        preferredMatchDay: data.preferredMatchDay,
        secondaryMatchDays: data.secondaryMatchDays,
        notAvailableDays: data.notAvailableDays,
        zpsClubId: data.zpsClub,
        zpsPlayerId: data.zpsPlayer,
        entryFeePayed: data.chessClubType === "other" ? false : null,
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

  const ratingSchema = z.coerce.number();
  const fideRating = ratingSchema.safeParse(playerFields[7]);
  const dwzRating = ratingSchema.safeParse(playerFields[4]);

  return {
    title: playerFields[8] || null,
    nationality: playerFields[9],
    fideRating: fideRating.success ? fideRating.data : null,
    dwzRating: dwzRating.success ? dwzRating.data : null,
    fideId: playerFields[6] || null,
    zpsClub: clubFields[4],
    zpsPlayer: clubFields[5],
  };
}

export async function updateParticipantRatingsFromServer(
  participantId: number,
): Promise<{
  success: boolean;
  message: string;
  updatedRatings?: {
    dwzRating: number | null;
    fideRating: number | null;
  };
}> {
  const session = await authWithRedirect();

  invariant(
    session.user.role === "admin",
    "Unauthorized: Admin access required",
  );

  const existingParticipant =
    await getParticipantForRatingUpdate(participantId);

  if (!existingParticipant) {
    return {
      success: false,
      message: "Teilnehmer nicht gefunden",
    };
  }

  try {
    const eloData = await getParticipantEloData(
      existingParticipant.profile.firstName,
      existingParticipant.profile.lastName,
    );

    if (!eloData) {
      return {
        success: false,
        message: `Keine Wertungsdaten für ${existingParticipant.profile.firstName} ${existingParticipant.profile.lastName} gefunden (nicht im DSB-Verein gefunden)`,
      };
    }

    await db
      .update(participant)
      .set({
        dwzRating: eloData.dwzRating,
        fideRating: eloData.fideRating,
        title: eloData.title,
        nationality: eloData.nationality,
        fideId: eloData.fideId,
        zpsClubId: eloData.zpsClub,
        zpsPlayerId: eloData.zpsPlayer,
      })
      .where(eq(participant.id, participantId));

    revalidatePath("/admin/nutzerverwaltung");

    return {
      success: true,
      message: `${existingParticipant.profile.firstName} ${existingParticipant.profile.lastName}: Wertungszahlen aktualisiert`,
      updatedRatings: {
        dwzRating: eloData.dwzRating,
        fideRating: eloData.fideRating,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: `Fehler bei ${existingParticipant.profile.firstName} ${existingParticipant.profile.lastName}: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
    };
  }
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

  revalidatePath("/admin/startgeld");
}
