"use server";

import { db } from "@/db/client";
import { matchday, matchdaySetupHelper } from "@/db/schema/matchday";
import { and, eq, inArray } from "drizzle-orm";
import { authWithRedirect } from "@/auth/utils";
import invariant from "tiny-invariant";
import { revalidatePath } from "next/cache";
import type { availableMatchDays } from "@/db/schema/columns.helpers";
import { DayOfWeek } from "@/db/types/group";

export async function updateRefereeIdByTournamentIdAndDayofWeek(
  dayofWeek: (typeof availableMatchDays)[number],
  tournamentId: number,
  refereeId: number | null,
) {
  const session = await authWithRedirect();
  invariant(session?.user.role === "admin", "Unauthorized");

  await db
    .update(matchday)
    .set({
      refereeId,
    })
    .where(
      and(
        eq(matchday.tournamentId, tournamentId),
        eq(matchday.dayOfWeek, dayofWeek),
        eq(matchday.refereeNeeded, true),
      ),
    );

  revalidatePath("/admin/schiedsrichter");
}

export async function updateSetupHelpers(
  tournamentId: number,
  groupedSetupHelperIds: Record<DayOfWeek, string[]>,
) {
  const session = await authWithRedirect();
  invariant(session?.user.role === "admin", "Unauthorized");

  const matchDays = await db
    .select({
      id: matchday.id,
      dayOfWeek: matchday.dayOfWeek,
    })
    .from(matchday)
    .where(eq(matchday.tournamentId, tournamentId));
  invariant(matchDays.length > 0, "Matchdays not found");

  const groupedMatchDayIds = matchDays.reduce(
    (acc, md) => {
      const dayOfWeek = md.dayOfWeek;
      if (!acc[dayOfWeek]) {
        acc[dayOfWeek] = [];
      }
      acc[dayOfWeek].push(md.id);
      return acc;
    },
    {} as Record<DayOfWeek, number[]>,
  );

  await db.transaction(async (tx) => {
    await tx.delete(matchdaySetupHelper).where(
      inArray(
        matchdaySetupHelper.matchdayId,
        matchDays.map((md) => md.id),
      ),
    );

    const insertValues = Object.entries(groupedSetupHelperIds).flatMap(
      ([day, setupHelperIds]) => {
        return setupHelperIds.map((setupHelperId, i) => ({
          matchdayId: groupedMatchDayIds[day as DayOfWeek][i],
          setupHelperId: parseInt(setupHelperId),
        }));
      },
    );
    await tx.insert(matchdaySetupHelper).values(insertValues);
  });

  revalidatePath("/admin/aufbauhelfer");
}
