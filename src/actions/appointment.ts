"use server";

import { db } from "@/db/client";
import { matchdayReferee, matchdaySetupHelper } from "@/db/schema/matchday";
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

async function getUpcomingRefereeAppointments(
  userId: string,
): Promise<Appointment[]> {
  const userReferee = await getRefereeByUserId(userId);
  if (!userReferee) {
    return [];
  }

  const profile = await getProfileByUserId(userId);
  invariant(profile, "Profile not found for user");

  const currentDate = getCurrentLocalDateTime().startOf("day").toJSDate();

  const refereeAppointments = await getRefereeAppointmentsByRefereeId(
    userReferee.id,
    currentDate,
  );

  if (refereeAppointments.length === 0) {
    return [];
  }

  const matchdayIds = refereeAppointments.map((app) => app.matchdayId);

  const [allRefereeInfo, allSetupHelpersInfo] = await Promise.all([
    getRefereeInfoByMatchdayIds(matchdayIds),
    getSetupHelpersInfoByMatchdayIds(matchdayIds, profile.id),
  ]);

  return refereeAppointments.map((appointment) => {
    const refereeForMatchday = allRefereeInfo.find(
      (ref) => ref.matchdayId === appointment.matchdayId,
    );
    const setupHelpersForMatchday = allSetupHelpersInfo.filter(
      (helper) => helper.matchdayId === appointment.matchdayId,
    );

    return {
      matchdayId: appointment.matchdayId,
      date: appointment.date,
      dayOfWeek: appointment.dayOfWeek,
      tournamentId: appointment.tournamentId,
      isCanceled: appointment.canceled === true,
      userRoles: {
        isReferee: true,
        isSetupHelper: false,
      },
      contactDetails: {
        otherSetupHelpers: setupHelpersForMatchday.map((helper) => ({
          firstName: helper.firstName,
          lastName: helper.lastName,
          email: helper.email,
          phoneNumber: helper.phoneNumber,
          canceled: helper.canceled,
        })),
        referee: refereeForMatchday
          ? {
              firstName: refereeForMatchday.firstName,
              lastName: refereeForMatchday.lastName,
              email: refereeForMatchday.email,
              phoneNumber: refereeForMatchday.phoneNumber,
              canceled: refereeForMatchday.canceled,
            }
          : null,
      },
    };
  });
}

async function getUpcomingSetupHelperAppointments(
  userId: string,
): Promise<Appointment[]> {
  const userSetupHelper = await getSetupHelperByUserId(userId);
  if (!userSetupHelper) {
    return [];
  }

  const profile = await getProfileByUserId(userId);
  invariant(profile, "Profile not found for user");

  const currentDate = getCurrentLocalDateTime().startOf("day").toJSDate();

  const setupHelperAppointments =
    await getSetupHelperAppointmentsBySetupHelperId(
      userSetupHelper.id,
      currentDate,
    );

  if (setupHelperAppointments.length === 0) {
    return [];
  }

  const matchdayIds = setupHelperAppointments.map((app) => app.matchdayId);

  const [allRefereeInfo, allSetupHelpersInfo] = await Promise.all([
    getRefereeInfoByMatchdayIds(matchdayIds),
    getSetupHelpersInfoByMatchdayIds(matchdayIds, profile.id),
  ]);

  return setupHelperAppointments.map((appointment) => {
    const refereeForMatchday = allRefereeInfo.find(
      (ref) => ref.matchdayId === appointment.matchdayId,
    );
    const setupHelpersForMatchday = allSetupHelpersInfo.filter(
      (helper) => helper.matchdayId === appointment.matchdayId,
    );

    return {
      matchdayId: appointment.matchdayId,
      date: appointment.date,
      dayOfWeek: appointment.dayOfWeek,
      tournamentId: appointment.tournamentId,
      isCanceled: appointment.canceled === true,
      userRoles: {
        isReferee: false,
        isSetupHelper: true,
      },
      contactDetails: {
        otherSetupHelpers: setupHelpersForMatchday.map((helper) => ({
          firstName: helper.firstName,
          lastName: helper.lastName,
          email: helper.email,
          phoneNumber: helper.phoneNumber,
          canceled: helper.canceled,
        })),
        referee: refereeForMatchday
          ? {
              firstName: refereeForMatchday.firstName,
              lastName: refereeForMatchday.lastName,
              email: refereeForMatchday.email,
              phoneNumber: refereeForMatchday.phoneNumber,
              canceled: refereeForMatchday.canceled,
            }
          : null,
      },
    };
  });
}

export async function getUpcomingAppointmentsByUserId(
  userId: string,
): Promise<Appointment[]> {
  const [refereeAppointments, setupHelperAppointments] = await Promise.all([
    getUpcomingRefereeAppointments(userId),
    getUpcomingSetupHelperAppointments(userId),
  ]);

  const allAppointments = [...refereeAppointments, ...setupHelperAppointments];

  const appointmentsByMatchday = new Map<number, Appointment>();

  for (const appointment of allAppointments) {
    const existing = appointmentsByMatchday.get(appointment.matchdayId);
    if (existing) {
      existing.isCanceled = existing.isCanceled || appointment.isCanceled;
      existing.userRoles.isReferee =
        existing.userRoles.isReferee || appointment.userRoles.isReferee;
      existing.userRoles.isSetupHelper =
        existing.userRoles.isSetupHelper || appointment.userRoles.isSetupHelper;
    } else {
      appointmentsByMatchday.set(appointment.matchdayId, appointment);
    }
  }

  return Array.from(appointmentsByMatchday.values()).sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );
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
