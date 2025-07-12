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
  invariant(
    tournament != null && tournament.stage === "registration",
    "Tournament not found or not in registration stage",
  );

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
      },
    });
}

export async function deleteParticipant(
  tournamentId: number,
  participantId: number,
) {
  const session = await authWithRedirect();

  const tournament = await getTournamentById(tournamentId);
  invariant(
    tournament != null && tournament.stage === "registration",
    "Tournament not found or not in registration stage",
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
