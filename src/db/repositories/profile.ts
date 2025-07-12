import { getTableColumns, eq } from "drizzle-orm";
import { db } from "../client";
import { profile } from "../schema/profile";
import { user } from "../schema/auth";
import { participant } from "../schema/participant";
import { juror } from "../schema/juror";
import { referee } from "../schema/referee";
import { setupHelper } from "../schema/setupHelper";
import { matchEnteringHelper } from "../schema/matchEnteringHelper";
import { gamePostponement } from "../schema/gamePostponement";
import { tournament } from "../schema/tournament";

export async function getProfileByUserId(userId: string) {
  return await db.query.profile.findFirst({
    where: (profile, { eq }) => eq(profile.userId, userId),
  });
}

export async function getProfilesByUserRole(role: "admin" | "user") {
  return await db
    .select(getTableColumns(profile))
    .from(profile)
    .leftJoin(user, eq(profile.userId, user.id))
    .where(eq(user.role, role));
}

export async function softDeleteProfile(profileId: number) {
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
