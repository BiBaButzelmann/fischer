"use server";

import { authWithRedirect } from "@/auth/utils";
import { and, count, eq, isNull, or } from "drizzle-orm";
import { db } from "../client";
import { game } from "../schema/game";
import { gamePostponement } from "../schema/gamePostponement";
import { juror } from "../schema/juror";
import { matchEnteringHelper } from "../schema/matchEnteringHelper";
import { participant } from "../schema/participant";
import { referee } from "../schema/referee";
import { setupHelper } from "../schema/setupHelper";
import { trainer } from "../schema/trainer";
import { tournament } from "../schema/tournament";
import { profile } from "../schema/profile";
import { getProfileByUserId } from "./profile";
import { user } from "../schema/auth";
import { getCurrentLocalDateTime } from "@/lib/date";

export async function softDeleteUser(userId: string) {
  const session = await authWithRedirect();
  if (session.user.role !== "admin") {
    return {
      success: false,
      reason: "Nur Admins können Profile löschen",
    };
  }
  const profileData = await getProfileByUserId(userId);
  if (!profileData) {
    return {
      success: false,
      reason: "Profil nicht gefunden",
    };
  }
  const { id: profileId } = profileData;
  const deletedAt = getCurrentLocalDateTime().toJSDate();

  return await db.transaction(async (tx) => {
    await tx
      .update(profile)
      .set({ deletedAt })
      .where(eq(profile.id, profileId));

    const participantData = await tx
      .update(participant)
      .set({ deletedAt })
      .where(eq(participant.profileId, profileId))
      .returning();

    await tx
      .update(juror)
      .set({ deletedAt })
      .where(eq(juror.profileId, profileId));

    await tx
      .update(referee)
      .set({ deletedAt })
      .where(eq(referee.profileId, profileId));

    await tx
      .update(setupHelper)
      .set({ deletedAt })
      .where(eq(setupHelper.profileId, profileId));

    await tx
      .update(matchEnteringHelper)
      .set({ deletedAt })
      .where(eq(matchEnteringHelper.profileId, profileId));

    await tx
      .update(gamePostponement)
      .set({ deletedAt })
      .where(eq(gamePostponement.postponedByProfileId, profileId));

    await tx
      .update(tournament)
      .set({ deletedAt })
      .where(eq(tournament.organizerProfileId, profileId));

    if (participantData.length > 0) {
      const participantId = participantData[0].id;

      await tx
        .update(game)
        .set({ result: "-:+" })
        .where(
          and(eq(game.whiteParticipantId, participantId), isNull(game.result)),
        );
      await tx
        .update(game)
        .set({ result: "+:-" })
        .where(
          and(eq(game.blackParticipantId, participantId), isNull(game.result)),
        );
      // set all bye games to -:-
      // consider all games without a board number to be a bye game
      await tx
        .update(game)
        .set({ result: "-:-" })
        .where(
          and(
            eq(game.whiteParticipantId, participantId),
            isNull(game.boardNumber),
          ),
        );
      await tx
        .update(game)
        .set({ result: "-:-" })
        .where(
          and(
            eq(game.blackParticipantId, participantId),
            isNull(game.boardNumber),
          ),
        );
    }

    return { success: true, deletedAt };
  });
}

export async function hardDeleteUser(userId: string) {
  const session = await authWithRedirect();
  if (session.user.role !== "admin") {
    return {
      success: false,
      reason: "Nur Admins können Profile löschen",
    };
  }

  const profileData = await getProfileByUserId(userId);
  if (!profileData) {
    return {
      success: false,
      reason: "Profil nicht gefunden",
    };
  }
  const { id: profileId } = profileData;

  const [gamePostponementCount] = await db
    .select({ count: count() })
    .from(gamePostponement)
    .where(eq(gamePostponement.postponedByProfileId, profileId));

  if (gamePostponementCount.count > 0) {
    return {
      success: false,
      reason: `Profil kann nicht gelöscht werden: ${gamePostponementCount.count} Spielverlegung(en) existieren für dieses Profil`,
    };
  }

  const [tournamentCount] = await db
    .select({ count: count() })
    .from(tournament)
    .where(eq(tournament.organizerProfileId, profileId));

  if (tournamentCount.count > 0) {
    return {
      success: false,
      reason: `Profil kann nicht gelöscht werden: ${tournamentCount.count} Turnier(e) werden von diesem Profil organisiert`,
    };
  }

  const [participantGameCount] = await db
    .select({ count: count() })
    .from(game)
    .leftJoin(
      participant,
      or(
        eq(game.whiteParticipantId, participant.id),
        eq(game.blackParticipantId, participant.id),
      ),
    )
    .where(eq(participant.profileId, profileId));

  if (participantGameCount.count > 0) {
    return {
      success: false,
      reason: `Profil kann nicht gelöscht werden: Teilnehmer ist an ${participantGameCount.count} Spiel(en) beteiligt`,
    };
  }

  return await db.transaction(async (tx) => {
    await tx.delete(juror).where(eq(juror.profileId, profileId));
    await tx.delete(referee).where(eq(referee.profileId, profileId));
    await tx.delete(setupHelper).where(eq(setupHelper.profileId, profileId));
    await tx.delete(trainer).where(eq(trainer.profileId, profileId));
    await tx
      .delete(matchEnteringHelper)
      .where(eq(matchEnteringHelper.profileId, profileId));
    await tx.delete(participant).where(eq(participant.profileId, profileId));
    await tx.delete(profile).where(eq(profile.id, profileId));
    await tx.delete(user).where(eq(user.id, userId));
    return { success: true, deletedAt: getCurrentLocalDateTime() };
  });
}

export async function restoreUser(userId: string) {
  const session = await authWithRedirect();
  if (session.user.role !== "admin") {
    return {
      success: false,
      reason: "Nur Admins können Profile wiederherstellen",
    };
  }

  const profileData = await getProfileByUserId(userId);
  if (!profileData) {
    return {
      success: false,
      reason: "Profil nicht gefunden",
    };
  }
  const { id: profileId } = profileData;

  return await db.transaction(async (tx) => {
    await tx
      .update(profile)
      .set({ deletedAt: null })
      .where(eq(profile.id, profileId));

    await tx
      .update(participant)
      .set({ deletedAt: null })
      .where(eq(participant.profileId, profileId));

    await tx
      .update(juror)
      .set({ deletedAt: null })
      .where(eq(juror.profileId, profileId));

    await tx
      .update(referee)
      .set({ deletedAt: null })
      .where(eq(referee.profileId, profileId));

    await tx
      .update(setupHelper)
      .set({ deletedAt: null })
      .where(eq(setupHelper.profileId, profileId));

    await tx
      .update(matchEnteringHelper)
      .set({ deletedAt: null })
      .where(eq(matchEnteringHelper.profileId, profileId));

    await tx
      .update(gamePostponement)
      .set({ deletedAt: null })
      .where(eq(gamePostponement.postponedByProfileId, profileId));

    await tx
      .update(tournament)
      .set({ deletedAt: null })
      .where(eq(tournament.organizerProfileId, profileId));

    return { success: true, restoredAt: getCurrentLocalDateTime() };
  });
}
