"use server";

import { db } from "../client";
import { setupHelper } from "../schema/setupHelper";
import { profile } from "../schema/profile";
import { matchday, matchdaySetupHelper } from "../schema/matchday";
import { and, eq, count } from "drizzle-orm";
import { SetupHelperWithAssignments } from "@/components/uebersicht/types";

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

export async function getSetupHelperWithAssignmentsByProfileIdAndTournamentId(
  profileId: number,
  tournamentId: number,
): Promise<SetupHelperWithAssignments | undefined> {
  const setupHelperData = await db.query.setupHelper.findFirst({
    where: and(
      eq(setupHelper.profileId, profileId),
      eq(setupHelper.tournamentId, tournamentId),
    ),
  });

  if (!setupHelperData) {
    return undefined;
  }

  const assignmentCount = await db
    .select({ count: count() })
    .from(matchdaySetupHelper)
    .where(eq(matchdaySetupHelper.setupHelperId, setupHelperData.id));

  return {
    ...setupHelperData,
    assignedDaysCount: assignmentCount[0]?.count ?? 0,
  };
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
