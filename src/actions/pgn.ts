"use server";

import { db } from "@/db/client";
import { pgn } from "@/db/schema/pgn";
import { getUserGameRights } from "@/lib/game-auth";
import { authWithRedirect } from "@/auth/utils";
import { action } from "@/lib/actions";
import invariant from "tiny-invariant";
import { revalidatePath } from "next/cache";
import { getTournamentById } from "@/db/repositories/tournament";
import { getGroupById } from "@/db/repositories/group";
import { getMatchdayById } from "@/db/repositories/match-day";
import { getParticipantsByGroupId } from "@/db/repositories/participant";
import { toLocalDateTime, toDateString } from "@/lib/date";
import { getFullName } from "@/lib/participant";
import { SearchParamsNumbers } from "@/components/partien/mass-pgn-download-button";

export const savePGN = action(async (newValue: string, gameId: number) => {
  const session = await authWithRedirect();
  const userRights = await getUserGameRights(gameId, session.user.id);

  invariant(
    userRights === "edit",
    "Du bist nicht berechtigt, diese Partie zu bearbeiten.",
  );

  await db
    .insert(pgn)
    .values({ gameId, value: newValue })
    .onConflictDoUpdate({
      target: pgn.gameId,
      set: { value: newValue },
    });
  revalidatePath("/partien");
});

export const buildPgnFileName = action(
  async ({
    tournamentId,
    groupId,
    round,
    participantId,
    matchdayId,
  }: SearchParamsNumbers) => {
    const tournament = await getTournamentById(tournamentId);
    invariant(tournament, "Turnier nicht gefunden");

    const parts = [tournament.name.replace(/\s+/g, "_")];

    if (groupId && !participantId) {
      const group = await getGroupById(groupId);
      if (group) {
        parts.push(group.groupName.replace(/\s+/g, "_"));
      }
    }

    if (round) {
      parts.push(`Runde_${round}`);
    }

    if (matchdayId) {
      const matchday = await getMatchdayById(matchdayId);
      if (matchday) {
        const dateStr = toDateString(toLocalDateTime(matchday.date)).replace(
          /\./g,
          "_",
        );
        parts.push(dateStr);
      }
    }

    if (participantId && groupId) {
      const participants = await getParticipantsByGroupId(groupId);
      const participant = participants.find((p) => p.id === participantId);
      if (participant) {
        const participantName = getFullName(
          participant.profile.firstName,
          participant.profile.lastName,
        );
        parts.push(participantName.replace(/\s+/g, "_"));
      }
    }

    return `${parts.join("_")}.pgn`;
  },
);
