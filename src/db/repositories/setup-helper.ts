"use server";

import { db } from "../client";
import { setupHelper } from "../schema/setupHelper";
import { profile } from "../schema/profile";
import { matchday, matchdaySetupHelper } from "../schema/matchday";
import { and, eq } from "drizzle-orm";

export async function getSetupHelperByProfileIdAndTournamentId(
  profileId: number,
  tournamentId: number,
) {
  return await db.query.setupHelper.findFirst({
    where: and(
      eq(setupHelper.profileId, profileId),
      eq(setupHelper.tournamentId, tournamentId),
    ),
  });
}

export async function getAllSetupHelpersByTournamentId(tournamentId: number) {
  return await db.query.setupHelper.findMany({
    where: eq(setupHelper.tournamentId, tournamentId),
    with: {
      profile: {
        columns: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });
}

export async function getSetupHelperByUserId(userId: string) {
  const rows = await db
    .select()
    .from(setupHelper)
    .leftJoin(profile, eq(setupHelper.profileId, profile.id))
    .where(eq(profile.userId, userId));
  return rows.length > 0 ? rows[0].setup_helper : undefined;
}

export async function getMatchdaysBySetupHelperId(setupHelperId: number) {
  return await db
    .select({
      setupHelper: setupHelper,
      matchday: matchday,
    })
    .from(setupHelper)
    .innerJoin(
      matchdaySetupHelper,
      eq(matchdaySetupHelper.setupHelperId, setupHelper.id),
    )
    .innerJoin(matchday, eq(matchday.id, matchdaySetupHelper.matchdayId))
    .where(eq(setupHelper.id, setupHelperId));
}
