"use server";

import { db } from "../client";
import { setupHelper } from "../schema/setupHelper";
import { profile } from "../schema/profile";
import { matchday, matchdaySetupHelper } from "../schema/matchday";
import { and, eq, count, asc, isNull, or } from "drizzle-orm";

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

export async function getSetupHelperAssignmentCountByProfileIdAndTournamentId(
  profileId: number,
  tournamentId: number,
): Promise<number> {
  const setupHelperData = await db.query.setupHelper.findFirst({
    where: and(
      eq(setupHelper.profileId, profileId),
      eq(setupHelper.tournamentId, tournamentId),
    ),
  });

  if (!setupHelperData) {
    return 0;
  }

  const assignmentCount = await db
    .select({ count: count() })
    .from(matchdaySetupHelper)
    .where(eq(matchdaySetupHelper.setupHelperId, setupHelperData.id));

  return assignmentCount[0]?.count ?? 0;
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
    .where(
      and(
        eq(setupHelper.id, setupHelperId),
        or(
          isNull(matchdaySetupHelper.canceled),
          eq(matchdaySetupHelper.canceled, false),
        ),
      ),
    )
    .orderBy(asc(matchday.date));
}

export async function getSetupHelperNamesByMatchdayId(matchdayId: number) {
  return await db
    .select({
      profileId: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phoneNumber: profile.phoneNumber,
      canceled: matchdaySetupHelper.canceled,
    })
    .from(matchdaySetupHelper)
    .innerJoin(
      setupHelper,
      eq(matchdaySetupHelper.setupHelperId, setupHelper.id),
    )
    .innerJoin(profile, eq(setupHelper.profileId, profile.id))
    .where(eq(matchdaySetupHelper.matchdayId, matchdayId));
}
