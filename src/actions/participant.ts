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

async function fetchRatingsByPlayerId(playerId: string): Promise<{
  title: string | null;
  nationality: string;
  fideRating: number | null;
  dwzRating: number | null;
  fideId: string | null;
} | null> {
  try {
    console.log(`Fetching ratings for player ID: ${playerId}`);

    const playerData = await fetch(
      `https://www.schachbund.de/php/dewis/spieler.php?pkz=${playerId}&format=csv`,
    );

    if (!playerData.ok) {
      console.error(
        `HTTP error: ${playerData.status} ${playerData.statusText}`,
      );
      return null;
    }

    const playerCsv = await playerData.text();
    console.log(`Raw CSV response: ${playerCsv.slice(0, 200)}...`);

    const playerCsvLines = playerCsv.split("\n");
    console.log(`CSV lines count: ${playerCsvLines.length}`);

    if (playerCsvLines.length < 2) {
      console.error("Not enough CSV lines returned");
      return null;
    }

    const matchingPlayerLine = playerCsvLines[1].replace(/[\n\r\t]/gm, "");
    console.log(`Player line: ${matchingPlayerLine}`);

    const playerFields = matchingPlayerLine.split("|");
    console.log(
      `Player fields count: ${playerFields.length}, fields:`,
      playerFields,
    );

    if (playerFields.length !== 10) {
      console.error(`Expected 10 fields, got ${playerFields.length}`);
      return null;
    }

    const ratingSchema = z.coerce.number();
    const fideRating = ratingSchema.safeParse(playerFields[7]);
    const dwzRating = ratingSchema.safeParse(playerFields[4]);

    const result = {
      title: playerFields[8] || null,
      nationality: playerFields[9],
      fideRating: fideRating.success ? fideRating.data : null,
      dwzRating: dwzRating.success ? dwzRating.data : null,
      fideId: playerFields[6] || null,
    };

    console.log(`Parsed result:`, result);
    return result;
  } catch (error) {
    console.error(`Error in fetchRatingsByPlayerId:`, error);
    return null;
  }
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

  console.log(`Starting rating update for participant ID: ${participantId}`);

  const existingParticipant =
    await getParticipantForRatingUpdate(participantId);

  if (!existingParticipant) {
    console.error(`Participant not found: ${participantId}`);
    return {
      success: false,
      message: "Teilnehmer nicht gefunden",
    };
  }

  console.log(`Found participant:`, existingParticipant);

  if (!existingParticipant.zpsPlayerId) {
    console.error(`No ZPS player ID for participant: ${participantId}`);
    return {
      success: false,
      message: `Keine ZPS-Spieler-ID für ${existingParticipant.profile.firstName} ${existingParticipant.profile.lastName}`,
    };
  }

  try {
    console.log(
      `Fetching ratings for ZPS ID: ${existingParticipant.zpsPlayerId}`,
    );
    const ratingData = await fetchRatingsByPlayerId(
      existingParticipant.zpsPlayerId,
    );

    if (!ratingData) {
      console.error(
        `No rating data received for participant: ${participantId}`,
      );
      return {
        success: false,
        message: `Keine Wertungsdaten für ${existingParticipant.profile.firstName} ${existingParticipant.profile.lastName} gefunden (möglicherweise kein DSB-Mitglied)`,
      };
    }

    console.log(
      `Updating database for participant: ${participantId}`,
      ratingData,
    );
    await db
      .update(participant)
      .set({
        dwzRating: ratingData.dwzRating,
        fideRating: ratingData.fideRating,
        title: ratingData.title,
        nationality: ratingData.nationality,
        fideId: ratingData.fideId,
      })
      .where(eq(participant.id, participantId));

    console.log(`Database update successful for participant: ${participantId}`);
    revalidatePath("/admin/nutzerverwaltung");

    return {
      success: true,
      message: `${existingParticipant.profile.firstName} ${existingParticipant.profile.lastName}: Wertungszahlen aktualisiert`,
      updatedRatings: {
        dwzRating: ratingData.dwzRating,
        fideRating: ratingData.fideRating,
      },
    };
  } catch (error) {
    console.error(`Error updating participant ${participantId}:`, error);
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
