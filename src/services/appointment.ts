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

type RefereeAppointment = {
  type: "referee";
};

type SetupHelperAppointment = {
  type: "setupHelper";
  otherSetupHelpers: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    canceled: boolean | null;
  }[];
};

type Appointment = RefereeAppointment | SetupHelperAppointment;

export type MatchdayAppointment = {
  matchdayId: number;
  matchdayDate: Date;
  tournamentId: number;
  cancelledAt: Date | null;
  appointments: Appointment[];
};

export async function getMatchdayAppointmentsByUserId(
  userId: string,
): Promise<MatchdayAppointment[]> {
  const [userReferee, userSetupHelper] = await Promise.all([
    getRefereeByUserId(userId),
    getSetupHelperByUserId(userId),
  ]);

  if (!userReferee && !userSetupHelper) {
    return [];
  }

  const currentDate = getCurrentLocalDateTime().startOf("day").toJSDate();
  const appointmentsByMatchday = new Map<number, MatchdayAppointment>();

  if (userReferee) {
    const refereeAppointments = await getRefereeAppointmentsByRefereeId(
      userReferee.id,
      currentDate,
    );

    for (const appointment of refereeAppointments) {
      const existing = appointmentsByMatchday.get(appointment.matchdayId);
      if (existing) {
        existing.appointments.push({ type: "referee" });
      } else {
        appointmentsByMatchday.set(appointment.matchdayId, {
          matchdayId: appointment.matchdayId,
          matchdayDate: appointment.date,
          tournamentId: appointment.tournamentId,
          cancelledAt: appointment.canceledAt,
          appointments: [{ type: "referee" }],
        });
      }
    }
  }

  if (userSetupHelper) {
    const profile = await getProfileByUserId(userId);
    invariant(profile, "Profile not found for user");

    const setupHelperAppointments =
      await getSetupHelperAppointmentsBySetupHelperId(
        userSetupHelper.id,
        currentDate,
      );

    if (setupHelperAppointments.length > 0) {
      const matchdayIds = setupHelperAppointments.map((app) => app.matchdayId);
      const allSetupHelpersInfo = await getSetupHelpersInfoByMatchdayIds(
        matchdayIds,
        profile.id,
      );

      for (const appointment of setupHelperAppointments) {
        const setupHelpersForMatchday = allSetupHelpersInfo.filter(
          (helper) => helper.matchdayId === appointment.matchdayId,
        );

        const setupHelperAppointment: SetupHelperAppointment = {
          type: "setupHelper",
          otherSetupHelpers: setupHelpersForMatchday.map((sh) => ({
            firstName: sh.firstName,
            lastName: sh.lastName,
            email: sh.email,
            phoneNumber: sh.phoneNumber,
            canceled: sh.canceledAt !== null,
          })),
        };

        const existing = appointmentsByMatchday.get(appointment.matchdayId);
        if (existing) {
          existing.appointments.push(setupHelperAppointment);
        } else {
          appointmentsByMatchday.set(appointment.matchdayId, {
            matchdayId: appointment.matchdayId,
            matchdayDate: appointment.date,
            tournamentId: appointment.tournamentId,
            cancelledAt: appointment.canceledAt,
            appointments: [setupHelperAppointment],
          });
        }
      }
    }
  }

  return Array.from(appointmentsByMatchday.values()).sort(
    (a, b) => a.matchdayDate.getTime() - b.matchdayDate.getTime(),
  );
}
