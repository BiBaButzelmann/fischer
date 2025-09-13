import {
  getRefereeAppointmentsByRefereeId,
  getSetupHelperAppointmentsBySetupHelperId,
  getSetupHelpersInfoByMatchdayIds,
} from "@/db/repositories/appointment";
import { getProfileByUserId } from "@/db/repositories/profile";
import { getRefereeByUserId } from "@/db/repositories/referee";
import { getSetupHelperByUserId } from "@/db/repositories/setup-helper";
import { getCurrentLocalDateTime } from "@/lib/date";
import invariant from "tiny-invariant";

export type RefereeAppointment = {
  matchdayId: number;
  date: Date;
  tournamentId: number;
  isCanceled: boolean;
};

export type SetupHelperAppointment = RefereeAppointment & {
  otherSetupHelpers: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    canceled: boolean | null;
  }[];
};

export async function getRefereeAppointmentsByUserId(userId: string) {
  const userReferee = await getRefereeByUserId(userId);
  if (!userReferee) {
    return [];
  }

  const currentDate = getCurrentLocalDateTime().startOf("day").toJSDate();

  const refereeAppointments = await getRefereeAppointmentsByRefereeId(
    userReferee.id,
    currentDate,
  );

  return refereeAppointments.map((appointment) => ({
    matchdayId: appointment.matchdayId,
    date: appointment.date,
    dayOfWeek: appointment.dayOfWeek,
    tournamentId: appointment.tournamentId,
    isCanceled: appointment.canceledAt !== null,
  }));
}

export async function getSetupHelperAppointmentsByUserId(userId: string) {
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

  const allSetupHelpersInfo = await getSetupHelpersInfoByMatchdayIds(
    matchdayIds,
    profile.id,
  );

  return setupHelperAppointments.map((appointment) => {
    const setupHelpersForMatchday = allSetupHelpersInfo.filter(
      (helper) => helper.matchdayId === appointment.matchdayId,
    );

    return {
      matchdayId: appointment.matchdayId,
      date: appointment.date,
      dayOfWeek: appointment.dayOfWeek,
      tournamentId: appointment.tournamentId,
      isCanceled: appointment.canceledAt !== null,
      otherSetupHelpers: setupHelpersForMatchday.map((sh) => ({
        firstName: sh.firstName,
        lastName: sh.lastName,
        email: sh.email,
        phoneNumber: sh.phoneNumber,
        canceled: sh.canceledAt !== null,
      })),
    };
  });
}
