"use server";

import { db } from "@/db/client";
import { matchday } from "@/db/schema/matchday";
import { and, eq } from "drizzle-orm";
import { authWithRedirect } from "@/auth/utils";
import invariant from "tiny-invariant";
import { revalidatePath } from "next/cache";
import type { availableMatchDays } from "@/db/schema/columns.helpers";

export async function updateRefereeIdByTournamentIdAndDayofWeek(
  dayofWeek: (typeof availableMatchDays)[number],
  tournamentId: number,
  refereeId: number,
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
