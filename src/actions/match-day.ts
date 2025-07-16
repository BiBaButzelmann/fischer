"use server";

import { db } from "@/db/client";
import { matchday } from "@/db/schema/matchday";
import { and, eq } from "drizzle-orm";
import { authWithRedirect } from "@/auth/utils";
import invariant from "tiny-invariant";
import { revalidatePath } from "next/cache";
import type { MatchDay } from "@/db/types/group";

export async function updateRefereeIdByTournamentIdAndDayofWeek(
  dayofWeek: MatchDay,
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
