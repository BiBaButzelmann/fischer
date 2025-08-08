"use server";

import { db } from "../client";
import { setupHelper } from "../schema/setupHelper";
import { matchdaySetupHelper } from "../schema/matchday";
import { and, eq, count } from "drizzle-orm";
import { type SetupHelperWithAssignments } from "../types/setup-helper";

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
