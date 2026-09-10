"use server";

import { db } from "@/db/client";
import { matchdayReferee, matchdaySetupHelper } from "@/db/schema/matchday";
import { authWithRedirect } from "@/auth/utils";
import { getRefereeByUserIdAndTournamentId } from "@/db/repositories/referee";
import { getSetupHelperByUserIdAndTournamentId } from "@/db/repositories/setup-helper";

import { and, eq, isNull, isNotNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import invariant from "tiny-invariant";
import {
  sendSetupHelperAppointmentEmail,
  sendRefereeAppointmentEmail,
} from "@/actions/email/appointment";
import { action } from "@/lib/actions";
import { getMatchdayById } from "@/db/repositories/match-day";
import { getTournamentById } from "@/db/repositories/tournament";

export const cancelMatchdayAppointments = action(async (matchdayId: number) => {
  const session = await authWithRedirect();
  const matchday = await getMatchdayById(matchdayId);
  invariant(matchday, "Matchday not found");

  const [referee, setupHelper, tournament] = await Promise.all([
    getRefereeByUserIdAndTournamentId(session.user.id, matchday.tournamentId),
    getSetupHelperByUserIdAndTournamentId(
      session.user.id,
      matchday.tournamentId,
    ),
    getTournamentById(matchday.tournamentId),
  ]);

  invariant(tournament?.stage === "running", "Tournament is not running");

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
            isNull(matchdayReferee.canceledAt),
          ),
        )
        .returning()
        .then((updated) => {
          if (updated.length > 0) {
            return sendRefereeAppointmentEmail(referee.id, matchdayId, true);
          }
        }),
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
            isNull(matchdaySetupHelper.canceledAt),
          ),
        )
        .returning()
        .then((updated) => {
          if (updated.length > 0) {
            return sendSetupHelperAppointmentEmail(
              setupHelper.id,
              matchdayId,
              true,
            );
          }
        }),
    );
  }

  await Promise.all(promises);
  revalidatePath("/turniere/[slug]/terminuebersicht", "page");
});

export const uncancelMatchdayAppointments = action(
  async (matchdayId: number) => {
    const session = await authWithRedirect();
    const matchday = await getMatchdayById(matchdayId);
    invariant(matchday, "Matchday not found");

    const [referee, setupHelper, tournament] = await Promise.all([
      getRefereeByUserIdAndTournamentId(session.user.id, matchday.tournamentId),
      getSetupHelperByUserIdAndTournamentId(
        session.user.id,
        matchday.tournamentId,
      ),
      getTournamentById(matchday.tournamentId),
    ]);

    invariant(tournament?.stage === "running", "Tournament is not running");

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
              isNotNull(matchdayReferee.canceledAt),
            ),
          )
          .returning()
          .then((updated) => {
            if (updated.length > 0) {
              return sendRefereeAppointmentEmail(referee.id, matchdayId, false);
            }
          }),
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
              isNotNull(matchdaySetupHelper.canceledAt),
            ),
          )
          .returning()
          .then((updated) => {
            if (updated.length > 0) {
              return sendSetupHelperAppointmentEmail(
                setupHelper.id,
                matchdayId,
                false,
              );
            }
          }),
      );
    }

    await Promise.all(promises);
    revalidatePath("/turniere/[slug]/terminuebersicht", "page");
  },
);
