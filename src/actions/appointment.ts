"use server";

import { db } from "@/db/client";
import { matchdayReferee, matchdaySetupHelper } from "@/db/schema/matchday";
import { referee } from "@/db/schema/referee";
import { setupHelper } from "@/db/schema/setupHelper";
import { authWithRedirect } from "@/auth/utils";
import { getRefereeByUserId } from "@/db/repositories/referee";
import { getSetupHelperByUserId } from "@/db/repositories/setup-helper";
import { getProfileByUserId } from "@/db/repositories/profile";
import {
  getRefereeAppointmentsByRefereeId,
  getSetupHelperAppointmentsBySetupHelperId,
  getRefereeInfoByMatchdayIds,
  getSetupHelpersInfoByMatchdayIds,
} from "@/db/repositories/appointment";
import { Appointment } from "@/types/appointment";
import { getCurrentLocalDateTime } from "@/lib/date";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import invariant from "tiny-invariant";
import {
  sendSetupHelperAppointmentEmail,
  sendRefereeAppointmentEmail,
} from "@/actions/email/appointment";

export type { Appointment as TerminuebersichtAppointment } from "@/types/appointment";

function combineAppointments(
  refereeAppointments: Array<{
    matchdayId: number;
    date: Date;
    dayOfWeek: string;
    tournamentId: number;
    canceled: boolean | null;
  }>,
  setupHelperAppointments: Array<{
    matchdayId: number;
    date: Date;
    dayOfWeek: string;
    tournamentId: number;
    canceled: boolean | null;
  }>,
) {
  const allAppointments = [
    ...refereeAppointments.map((app) => ({
      matchdayId: app.matchdayId,
      date: app.date,
      dayOfWeek: app.dayOfWeek,
      tournamentId: app.tournamentId,
      refereeCanceled: app.canceled,
      setupHelperCanceled: null,
      userIsReferee: true,
      userIsSetupHelper: false,
    })),
    ...setupHelperAppointments.map((app) => ({
      matchdayId: app.matchdayId,
      date: app.date,
      dayOfWeek: app.dayOfWeek,
      tournamentId: app.tournamentId,
      refereeCanceled: null,
      setupHelperCanceled: app.canceled,
      userIsReferee: false,
      userIsSetupHelper: true,
    })),
  ];

  return allAppointments
    .reduce(
      (acc, curr) => {
        const existing = acc.find((a) => a.matchdayId === curr.matchdayId);
        if (existing) {
          if (curr.refereeCanceled !== null)
            existing.refereeCanceled = curr.refereeCanceled;
          if (curr.setupHelperCanceled !== null)
            existing.setupHelperCanceled = curr.setupHelperCanceled;
          existing.userIsReferee = existing.userIsReferee || curr.userIsReferee;
          existing.userIsSetupHelper =
            existing.userIsSetupHelper || curr.userIsSetupHelper;
        } else {
          acc.push(curr);
        }
        return acc;
      },
      [] as Array<{
        matchdayId: number;
        date: Date;
        dayOfWeek: string;
        tournamentId: number;
        refereeCanceled: boolean | null;
        setupHelperCanceled: boolean | null;
        userIsReferee: boolean;
        userIsSetupHelper: boolean;
      }>,
    )
    .map((app) => ({
      matchdayId: app.matchdayId,
      date: app.date,
      dayOfWeek: app.dayOfWeek,
      tournamentId: app.tournamentId,
      isCanceled:
        app.refereeCanceled === true || app.setupHelperCanceled === true,
      userRoles: {
        isReferee: app.userIsReferee,
        isSetupHelper: app.userIsSetupHelper,
      },
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

function createContactDetailsLookup(
  refereeInfo: Array<{
    matchdayId: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    canceled: boolean | null;
  }>,
  setupHelpersInfo: Array<{
    matchdayId: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    canceled: boolean | null;
  }>,
) {
  const refereeByMatchday = new Map(
    refereeInfo.map((ref) => [
      ref.matchdayId,
      {
        firstName: ref.firstName,
        lastName: ref.lastName,
        email: ref.email,
        phoneNumber: ref.phoneNumber,
        canceled: ref.canceled,
      },
    ]),
  );

  const setupHelpersByMatchday = setupHelpersInfo.reduce(
    (acc, helper) => {
      if (!acc.has(helper.matchdayId)) {
        acc.set(helper.matchdayId, []);
      }
      acc.get(helper.matchdayId)!.push({
        firstName: helper.firstName,
        lastName: helper.lastName,
        email: helper.email,
        phoneNumber: helper.phoneNumber,
        canceled: helper.canceled,
      });
      return acc;
    },
    new Map<
      number,
      Array<{
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
        canceled: boolean | null;
      }>
    >(),
  );

  return { refereeByMatchday, setupHelpersByMatchday };
}

export async function getUpcomingAppointmentsByUserId(
  userId: string,
): Promise<Appointment[]> {
  const profile = await getProfileByUserId(userId);

  invariant(profile, "Profile not found for user");

  const [userReferee, userSetupHelper] = await Promise.all([
    db.query.referee.findFirst({
      where: eq(referee.profileId, profile.id),
    }),
    db.query.setupHelper.findFirst({
      where: eq(setupHelper.profileId, profile.id),
    }),
  ]);

  if (!userReferee && !userSetupHelper) {
    return [];
  }

  const currentDate = getCurrentLocalDateTime().startOf("day").toJSDate();

  const [refereeAppointments, setupHelperAppointments] = await Promise.all([
    userReferee
      ? getRefereeAppointmentsByRefereeId(userReferee.id, currentDate)
      : [],
    userSetupHelper
      ? getSetupHelperAppointmentsBySetupHelperId(
          userSetupHelper.id,
          currentDate,
        )
      : [],
  ]);

  const combinedAppointments = combineAppointments(
    refereeAppointments,
    setupHelperAppointments,
  );

  if (combinedAppointments.length === 0) {
    return [];
  }

  const matchdayIds = combinedAppointments.map((app) => app.matchdayId);

  const [allRefereeInfo, allSetupHelpersInfo] = await Promise.all([
    getRefereeInfoByMatchdayIds(matchdayIds),
    getSetupHelpersInfoByMatchdayIds(matchdayIds, profile.id),
  ]);

  const { refereeByMatchday, setupHelpersByMatchday } =
    createContactDetailsLookup(allRefereeInfo, allSetupHelpersInfo);

  return combinedAppointments.map((appointment) => ({
    ...appointment,
    contactDetails: {
      otherSetupHelpers:
        setupHelpersByMatchday.get(appointment.matchdayId) || [],
      referee: refereeByMatchday.get(appointment.matchdayId) || null,
    },
  }));
}

export async function cancelAppointment(matchdayId: number) {
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
}

export async function uncancelAppointment(matchdayId: number) {
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
}
