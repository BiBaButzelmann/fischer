import {
  getRefereeAppointmentsByRefereeId,
  getSetupHelperAppointmentsBySetupHelperId,
  getSetupHelpersInfoByMatchdayIds,
} from "@/db/repositories/appointment";
import { getProfileByUserId } from "@/db/repositories/profile";
import { getRefereeByUserId } from "@/db/repositories/referee";
import { getSetupHelperByUserId } from "@/db/repositories/setup-helper";
import { getCurrentLocalDateTime } from "@/lib/date";
import {
  getSetupHelperTimeFromTournamentTime,
  getDateTimeFromTournamentTime,
} from "@/lib/game-time";
import invariant from "tiny-invariant";

export type Appointment = {
  matchdayId: number;
  date: Date;
  dayOfWeek: string;
  tournamentId: number;
  isCanceled: boolean;
};

export type RefereeAppointment = Appointment & {
  gameStartTime: Date;
};

export type SetupHelperAppointment = Appointment & {
  setupHelperTime: Date;
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

  return Promise.all(
    refereeAppointments.map(async (appointment) => {
      const gameStartTime = await getDateTimeFromTournamentTime(
        appointment.date,
        appointment.tournamentId,
      );

      return {
        matchdayId: appointment.matchdayId,
        date: appointment.date,
        dayOfWeek: appointment.dayOfWeek,
        tournamentId: appointment.tournamentId,
        isCanceled: appointment.canceledAt !== null,
        gameStartTime: gameStartTime.toJSDate(),
      };
    }),
  );
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

  return Promise.all(
    setupHelperAppointments.map(async (appointment) => {
      const setupHelpersForMatchday = allSetupHelpersInfo.filter(
        (helper) => helper.matchdayId === appointment.matchdayId,
      );

      const setupHelperTime = await getSetupHelperTimeFromTournamentTime(
        appointment.date,
        appointment.tournamentId,
      );

      return {
        matchdayId: appointment.matchdayId,
        date: appointment.date,
        dayOfWeek: appointment.dayOfWeek,
        tournamentId: appointment.tournamentId,
        isCanceled: appointment.canceledAt !== null,
        setupHelperTime: setupHelperTime.toJSDate(),
        otherSetupHelpers: setupHelpersForMatchday.map((sh) => ({
          firstName: sh.firstName,
          lastName: sh.lastName,
          email: sh.email,
          phoneNumber: sh.phoneNumber,
          canceled: sh.canceledAt !== null,
        })),
      };
    }),
  );
}
