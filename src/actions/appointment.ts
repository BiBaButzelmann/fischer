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

export const cancelMatchdayAppointments = action(async (matchdayId: number) => {
  const session = await authWithRedirect();

  const [referee, setupHelper] = await Promise.all([
    getRefereeByUserId(session.user.id),
    getSetupHelperByUserId(session.user.id),
  ]);

  invariant(
    referee || setupHelper,
    "Unauthorized: User must be either a referee or setup helper",
  );

  const promises = [];

  if (referee) {
    promises.push(
      db
        .update(matchdayReferee)
        .set({ canceledAt: new Date() })
        .where(
          and(
            eq(matchdayReferee.matchdayId, matchdayId),
            eq(matchdayReferee.refereeId, referee.id),
          ),
        ),
      sendRefereeAppointmentEmail(referee.id, matchdayId, true),
    );
  }

  if (setupHelper) {
    promises.push(
      db
        .update(matchdaySetupHelper)
        .set({ canceledAt: new Date() })
        .where(
          and(
            eq(matchdaySetupHelper.matchdayId, matchdayId),
            eq(matchdaySetupHelper.setupHelperId, setupHelper.id),
          ),
        ),
      sendSetupHelperAppointmentEmail(setupHelper.id, matchdayId, true),
    );
  }

  await Promise.all(promises);
  revalidatePath("/terminuebersicht");
});

export const uncancelMatchdayAppointments = action(
  async (matchdayId: number) => {
    const session = await authWithRedirect();

    const [referee, setupHelper] = await Promise.all([
      getRefereeByUserId(session.user.id),
      getSetupHelperByUserId(session.user.id),
    ]);

    invariant(
      referee || setupHelper,
      "Unauthorized: User must be either a referee or setup helper",
    );

    const promises = [];

    if (referee) {
      promises.push(
        db
          .update(matchdayReferee)
          .set({ canceledAt: null })
          .where(
            and(
              eq(matchdayReferee.matchdayId, matchdayId),
              eq(matchdayReferee.refereeId, referee.id),
            ),
          ),
        sendRefereeAppointmentEmail(referee.id, matchdayId, false),
      );
    }

    if (setupHelper) {
      promises.push(
        db
          .update(matchdaySetupHelper)
          .set({ canceledAt: null })
          .where(
            and(
              eq(matchdaySetupHelper.matchdayId, matchdayId),
              eq(matchdaySetupHelper.setupHelperId, setupHelper.id),
            ),
          ),
        sendSetupHelperAppointmentEmail(setupHelper.id, matchdayId, false),
      );
    }

    await Promise.all(promises);
    revalidatePath("/terminuebersicht");
  },
);
