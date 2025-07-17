"use server";

import { db } from "../client";
import { matchday, matchdaySetupHelper } from "../schema/matchday";
import { profile } from "../schema/profile";
import { setupHelper } from "../schema/setupHelper";
import { and, eq, getTableColumns } from "drizzle-orm";
import { DayOfWeek } from "../types/group";
import { SetupHelperWithName } from "../types/setup-helper";

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

export async function getAssignedSetupHelpersByTournamentId(
  tournamentId: number,
) {
  const setupHelpers = await db
    .select({
      dayOfWeek: matchday.dayOfWeek,
      ...getTableColumns(setupHelper),
      profile: {
        firstName: profile.firstName,
        lastName: profile.lastName,
      },
    })
    .from(matchday)
    .innerJoin(
      matchdaySetupHelper,
      eq(matchday.id, matchdaySetupHelper.matchdayId),
    )
    .innerJoin(
      setupHelper,
      eq(setupHelper.id, matchdaySetupHelper.setupHelperId),
    )
    .innerJoin(profile, eq(profile.id, setupHelper.profileId))
    .where(eq(setupHelper.tournamentId, tournamentId))
    .orderBy(matchday.date);

  return setupHelpers.reduce(
    (acc, entry) => {
      const { dayOfWeek, ...setupHelper } = entry;
      if (dayOfWeek == null) {
        return acc;
      }
      if (!acc[dayOfWeek]) {
        acc[dayOfWeek] = [];
      }
      acc[dayOfWeek].push(setupHelper);

      return acc;
    },
    {} as Record<DayOfWeek, SetupHelperWithName[]>,
  );
}
