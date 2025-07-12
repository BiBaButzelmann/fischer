"use server";

import { authWithRedirect } from "@/auth/utils";
import { count, eq, or } from "drizzle-orm";
import { db } from "../client";
import { game } from "../schema/game";
import { gamePostponement } from "../schema/gamePostponement";
import { juror } from "../schema/juror";
import { matchEnteringHelper } from "../schema/matchEnteringHelper";
import { participant } from "../schema/participant";
import { referee } from "../schema/referee";
import { setupHelper } from "../schema/setupHelper";
import { tournament } from "../schema/tournament";
import { profile } from "../schema/profile";
import { getProfileByUserId } from "./profile";
import { user } from "../schema/auth";

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
  const deletedAt = new Date();

  return await db.transaction(async (tx) => {
    await tx
      .update(profile)
      .set({ deletedAt })
      .where(eq(profile.id, profileId));

    await tx
      .update(participant)
      .set({ deletedAt })
      .where(eq(participant.profileId, profileId));

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

    return { success: true, deletedAt };
  });
}

export async function hardDeleteProfile(userId: string) {
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
    await tx
      .delete(matchEnteringHelper)
      .where(eq(matchEnteringHelper.profileId, profileId));
    await tx.delete(participant).where(eq(participant.profileId, profileId));
    await tx.delete(profile).where(eq(profile.id, profileId));
    await tx.delete(user).where(eq(user.id, userId));
    return { success: true, deletedAt: new Date() };
  });
}
