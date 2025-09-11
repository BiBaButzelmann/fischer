"use server";

import { db } from "@/db/client";
import { matchdayReferee, matchdaySetupHelper } from "@/db/schema/matchday";
import { authWithRedirect } from "@/auth/utils";
import { getRefereeByUserId } from "@/db/repositories/referee";
import { getSetupHelperByUserId } from "@/db/repositories/setup-helper";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import invariant from "tiny-invariant";
import {
  sendSetupHelperAppointmentEmail,
  sendRefereeAppointmentEmail,
} from "@/actions/email/appointment";
import { action } from "@/lib/actions";

export const cancelRefereeAppointment = action(async (matchdayId: number) => {
  const session = await authWithRedirect();

  const referee = await getRefereeByUserId(session.user.id);
  invariant(referee, "Unauthorized: User is not a referee");

  await db
    .update(matchdayReferee)
    .set({ canceledAt: new Date() })
    .where(
      and(
        eq(matchdayReferee.matchdayId, matchdayId),
        eq(matchdayReferee.refereeId, referee.id),
      ),
    );

  await sendRefereeAppointmentEmail(referee.id, matchdayId, true);

  revalidatePath("/terminuebersicht");
});

export const uncancelRefereeAppointment = action(async (matchdayId: number) => {
  const session = await authWithRedirect();

  const referee = await getRefereeByUserId(session.user.id);
  invariant(referee, "Unauthorized: User is not a referee");

  await db
    .update(matchdayReferee)
    .set({ canceledAt: null })
    .where(
      and(
        eq(matchdayReferee.matchdayId, matchdayId),
        eq(matchdayReferee.refereeId, referee.id),
      ),
    );

  await sendRefereeAppointmentEmail(referee.id, matchdayId, false);

  revalidatePath("/terminuebersicht");
});

export const cancelSetupHelperAppointment = action(
  async (matchdayId: number) => {
    const session = await authWithRedirect();

    const setupHelper = await getSetupHelperByUserId(session.user.id);
    invariant(setupHelper, "Unauthorized: User is not a setup helper");

    await db
      .update(matchdaySetupHelper)
      .set({ canceledAt: new Date() })
      .where(
        and(
          eq(matchdaySetupHelper.matchdayId, matchdayId),
          eq(matchdaySetupHelper.setupHelperId, setupHelper.id),
        ),
      );

    await sendSetupHelperAppointmentEmail(setupHelper.id, matchdayId, true);

    revalidatePath("/terminuebersicht");
  },
);

export const uncancelSetupHelperAppointment = action(
  async (matchdayId: number) => {
    const session = await authWithRedirect();

    const setupHelper = await getSetupHelperByUserId(session.user.id);
    invariant(setupHelper, "Unauthorized: User is not a setup helper");

    await db
      .update(matchdaySetupHelper)
      .set({ canceledAt: null })
      .where(
        and(
          eq(matchdaySetupHelper.matchdayId, matchdayId),
          eq(matchdaySetupHelper.setupHelperId, setupHelper.id),
        ),
      );

    await sendSetupHelperAppointmentEmail(setupHelper.id, matchdayId, false);

    revalidatePath("/terminuebersicht");
  },
);
