import {
  getRefereeAppointmentsByRefereeId,
  getRefereeInfoByMatchdayIds,
  getSetupHelperAppointmentsBySetupHelperId,
  getSetupHelpersInfoByMatchdayIds,
} from "@/db/repositories/appointment";
import { getProfileByUserId } from "@/db/repositories/profile";
import { getRefereeByUserId } from "@/db/repositories/referee";
import { getSetupHelperByUserId } from "@/db/repositories/setup-helper";
import { getCurrentLocalDateTime } from "@/lib/date";
import { Appointment } from "@/types/appointment";
import invariant from "tiny-invariant";

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
      isCanceled: appointment.canceledAt !== null,
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
          canceled: helper.canceledAt !== null,
        })),
        referee: refereeForMatchday
          ? {
              firstName: refereeForMatchday.firstName,
              lastName: refereeForMatchday.lastName,
              email: refereeForMatchday.email,
              phoneNumber: refereeForMatchday.phoneNumber,
              canceled: refereeForMatchday.canceledAt !== null,
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
      isCanceled: appointment.canceledAt !== null,
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
          canceled: helper.canceledAt !== null,
        })),
        referee: refereeForMatchday
          ? {
              firstName: refereeForMatchday.firstName,
              lastName: refereeForMatchday.lastName,
              email: refereeForMatchday.email,
              phoneNumber: refereeForMatchday.phoneNumber,
              canceled: refereeForMatchday.canceledAt !== null,
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
