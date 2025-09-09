"use server";

import { db } from "@/db/client";
import { matchdaySetupHelper } from "@/db/schema/matchday";
import { getSetupHelperByUserId } from "@/db/repositories/setup-helper";
import { authWithRedirect } from "@/auth/utils";
import { and, eq } from "drizzle-orm";
import invariant from "tiny-invariant";
import { revalidatePath } from "next/cache";

export async function cancelSetupHelperAppointment(matchdayId: number) {
  const session = await authWithRedirect();

  const setupHelper = await getSetupHelperByUserId(session.user.id);
  invariant(setupHelper, "Unauthorized: User is not a setup helper");

  await db
    .update(matchdaySetupHelper)
    .set({ canceled: true })
    .where(
      and(
        eq(matchdaySetupHelper.matchdayId, matchdayId),
        eq(matchdaySetupHelper.setupHelperId, setupHelper.id),
      ),
    );

  revalidatePath("/aufbauhelfer");
}

export async function uncancelSetupHelperAppointment(matchdayId: number) {
  const session = await authWithRedirect();

  const setupHelper = await getSetupHelperByUserId(session.user.id);
  invariant(setupHelper, "Unauthorized: User is not a setup helper");

  await db
    .update(matchdaySetupHelper)
    .set({ canceled: false })
    .where(
      and(
        eq(matchdaySetupHelper.matchdayId, matchdayId),
        eq(matchdaySetupHelper.setupHelperId, setupHelper.id),
      ),
    );

  revalidatePath("/aufbauhelfer");
}
