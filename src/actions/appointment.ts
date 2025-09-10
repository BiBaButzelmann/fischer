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

export const cancelAppointment = action(async (matchdayId: number) => {
  const session = await authWithRedirect();

  const [referee, setupHelper] = await Promise.all([
    getRefereeByUserId(session.user.id),
    getSetupHelperByUserId(session.user.id),
  ]);
  invariant(
    referee || setupHelper,
    "Unauthorized: User is not a referee or setup helper",
  );

  await db.transaction(async (tx) => {
    if (referee) {
      await tx
        .update(matchdayReferee)
        .set({ canceled: true })
        .where(
          and(
            eq(matchdayReferee.matchdayId, matchdayId),
            eq(matchdayReferee.refereeId, referee.id),
          ),
        );
    }

    if (setupHelper) {
      await tx
        .update(matchdaySetupHelper)
        .set({ canceled: true })
        .where(
          and(
            eq(matchdaySetupHelper.matchdayId, matchdayId),
            eq(matchdaySetupHelper.setupHelperId, setupHelper.id),
          ),
        );
    }
  });

  const emailPromises = [];
  if (referee) {
    emailPromises.push(
      sendRefereeAppointmentEmail(referee.id, matchdayId, true),
    );
  }
  if (setupHelper) {
    emailPromises.push(
      sendSetupHelperAppointmentEmail(setupHelper.id, matchdayId, true),
    );
  }
  await Promise.all(emailPromises);

  revalidatePath("/terminuebersicht");
});

export const uncancelAppointment = action(async (matchdayId: number) => {
  const session = await authWithRedirect();

  const [referee, setupHelper] = await Promise.all([
    getRefereeByUserId(session.user.id),
    getSetupHelperByUserId(session.user.id),
  ]);

  invariant(
    referee || setupHelper,
    "Unauthorized: User is not a referee or setup helper",
  );

  await db.transaction(async (tx) => {
    if (referee) {
      await tx
        .update(matchdayReferee)
        .set({ canceled: false })
        .where(
          and(
            eq(matchdayReferee.matchdayId, matchdayId),
            eq(matchdayReferee.refereeId, referee.id),
          ),
        );
    }

    if (setupHelper) {
      await tx
        .update(matchdaySetupHelper)
        .set({ canceled: false })
        .where(
          and(
            eq(matchdaySetupHelper.matchdayId, matchdayId),
            eq(matchdaySetupHelper.setupHelperId, setupHelper.id),
          ),
        );
    }
  });

  const emailPromises = [];
  if (referee) {
    emailPromises.push(
      sendRefereeAppointmentEmail(referee.id, matchdayId, false),
    );
  }
  if (setupHelper) {
    emailPromises.push(
      sendSetupHelperAppointmentEmail(setupHelper.id, matchdayId, false),
    );
  }
  await Promise.all(emailPromises);

  revalidatePath("/terminuebersicht");
});
