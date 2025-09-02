"use server";

import { db } from "@/db/client";
import { group } from "@/db/schema/group";
import { sendGamePostponementNotifications } from "@/email/gamePostponement";
import { displayLongDate, toLocalDateTime } from "@/lib/date";
import { eq } from "drizzle-orm";
import type { GameWithParticipantProfilesAndMatchday } from "@/db/types/game";
import type { ParticipantWithName } from "@/db/types/participant";
import type { MatchDay } from "@/db/types/match-day";
import invariant from "tiny-invariant";

export async function sendGamePostponementEmails(
  gameData: GameWithParticipantProfilesAndMatchday,
  postponingParticipant: ParticipantWithName,
  currentMatchday: MatchDay,
  newMatchday: MatchDay,
) {
  invariant(gameData.whiteParticipant, "White participant is required");
  invariant(gameData.blackParticipant, "Black participant is required");
  const groupData = await db.query.group.findFirst({
    where: eq(group.id, gameData.groupId),
    columns: { groupName: true },
  });

  const postponingPlayerName = `${postponingParticipant.profile.firstName} ${postponingParticipant.profile.lastName}`;
  const whitePlayerName = `${gameData.whiteParticipant.profile.firstName} ${gameData.whiteParticipant.profile.lastName}`;
  const blackPlayerName = `${gameData.blackParticipant.profile.firstName} ${gameData.blackParticipant.profile.lastName}`;

  const oldDateFormatted = displayLongDate(
    toLocalDateTime(currentMatchday.date),
  );
  const newDateFormatted = displayLongDate(toLocalDateTime(newMatchday.date));

  const whitePlayerEmailData = {
    playerEmail: gameData.whiteParticipant.profile.email,
    playerName: gameData.whiteParticipant.profile.firstName,
    opponentName: blackPlayerName,
    postponingPlayerName,
    gameDetails: {
      round: gameData.round,
      groupName: groupData?.groupName || "Unbekannte Gruppe",
    },
    oldDate: oldDateFormatted,
    newDate: newDateFormatted,
    contactInfo: {
      opponentEmail: gameData.blackParticipant.profile.email,
      opponentPhone:
        gameData.blackParticipant.profile.phoneNumber || "Nicht verfügbar",
    },
  };

  const blackPlayerEmailData = {
    playerEmail: gameData.blackParticipant.profile.email,
    playerName: gameData.blackParticipant.profile.firstName,
    opponentName: whitePlayerName,
    postponingPlayerName,
    gameDetails: {
      round: gameData.round,
      groupName: groupData?.groupName || "Unbekannte Gruppe",
    },
    oldDate: oldDateFormatted,
    newDate: newDateFormatted,
    contactInfo: {
      opponentEmail: gameData.whiteParticipant.profile.email,
      opponentPhone:
        gameData.whiteParticipant.profile.phoneNumber || "Nicht verfügbar",
    },
  };

  await sendGamePostponementNotifications(
    whitePlayerEmailData,
    blackPlayerEmailData,
  );
}
