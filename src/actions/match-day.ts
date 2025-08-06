"use server";

import { db } from "@/db/client";
import { matchday, matchdaySetupHelper } from "@/db/schema/matchday";
import { eq } from "drizzle-orm";
import { authWithRedirect } from "@/auth/utils";
import invariant from "tiny-invariant";
import { revalidatePath } from "next/cache";

export async function updateRefereeIdByMatchdayId(
  matchdayId: number,
  refereeId: number | null,
) {
  const session = await authWithRedirect();
  invariant(session?.user.role === "admin", "Unauthorized");

  await db
    .update(matchday)
    .set({
      refereeId,
    })
    .where(eq(matchday.id, matchdayId));

  revalidatePath("/admin/spieltage");
}

export async function updateRefereeAssignments(
  assignments: [number, number | null][],
) {
  const session = await authWithRedirect();
  invariant(session?.user.role === "admin", "Unauthorized");

  await db.transaction(async (tx) => {
    for (const [matchdayId, refereeId] of assignments) {
      await tx
        .update(matchday)
        .set({ refereeId })
        .where(eq(matchday.id, matchdayId));
    }
  });

  revalidatePath("/admin/spieltage");
}

export async function updateSetupHelpersForMatchday(
  matchdayId: number,
  setupHelperIds: number[],
) {
  const session = await authWithRedirect();
  invariant(session?.user.role === "admin", "Unauthorized");

  await db.transaction(async (tx) => {
    await tx
      .delete(matchdaySetupHelper)
      .where(eq(matchdaySetupHelper.matchdayId, matchdayId));

    if (setupHelperIds.length > 0) {
      const insertValues = setupHelperIds.map((setupHelperId) => ({
        matchdayId,
        setupHelperId,
      }));
      await tx.insert(matchdaySetupHelper).values(insertValues);
    }
  });

  revalidatePath("/admin/spieltage");
}
