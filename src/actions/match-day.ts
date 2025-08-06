"use server";

import { db } from "@/db/client";
import { matchdaySetupHelper, matchdayReferee } from "@/db/schema/matchday";
import { eq } from "drizzle-orm";
import { authWithRedirect } from "@/auth/utils";
import invariant from "tiny-invariant";
import { revalidatePath } from "next/cache";

export async function updateRefereeAssignments(
  assignments: [number, number | null][],
) {
  const session = await authWithRedirect();
  invariant(session?.user.role === "admin", "Unauthorized");

  await db.transaction(async (tx) => {
    for (const [matchdayId, refereeId] of assignments) {
      await tx
        .delete(matchdayReferee)
        .where(eq(matchdayReferee.matchdayId, matchdayId));
      if (refereeId !== null) {
        await tx.insert(matchdayReferee).values({
          matchdayId,
          refereeId,
        });
      }
    }
  });

  revalidatePath("/admin/spieltage");
}

export async function updateSetupHelperAssignments(
  assignments: [number, number[]][],
) {
  const session = await authWithRedirect();
  invariant(session?.user.role === "admin", "Unauthorized");

  await db.transaction(async (tx) => {
    for (const [matchdayId, setupHelperIds] of assignments) {
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
    }
  });

  revalidatePath("/admin/spieltage");
}
