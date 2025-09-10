"use server";

import { db } from "@/db/client";
import { profile } from "@/db/schema/profile";
import { setupHelper } from "@/db/schema/setupHelper";
import { referee } from "@/db/schema/referee";
import { getMatchdayById } from "@/db/repositories/match-day";
import { sendSetupHelperAppointmentNotification, sendRefereeAppointmentNotification } from "@/email/appointment";
import { displayLongDate, toLocalDateTime } from "@/lib/date";
import { eq } from "drizzle-orm";
import invariant from "tiny-invariant";

export async function sendSetupHelperAppointmentEmail(
  setupHelperId: number,
  matchdayId: number,
  isCanceled: boolean,
) {
  const setupHelperData = await db
    .select({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phoneNumber: profile.phoneNumber,
    })
    .from(setupHelper)
    .innerJoin(profile, eq(setupHelper.profileId, profile.id))
    .where(eq(setupHelper.id, setupHelperId))
    .limit(1);

  invariant(setupHelperData.length > 0, "Setup helper not found");
  const setupHelperProfile = setupHelperData[0];

  const matchdayInfo = await getMatchdayById(matchdayId);
  invariant(matchdayInfo, "Matchday not found");

  const setupHelperName = `${setupHelperProfile.firstName} ${setupHelperProfile.lastName}`;
  const formattedDate = displayLongDate(toLocalDateTime(matchdayInfo.date));

  const emailData = {
    name: setupHelperName,
    isCancellation: isCanceled,
    date: formattedDate,
    email: setupHelperProfile.email,
    phoneNumber: setupHelperProfile.phoneNumber,
  };

  await sendSetupHelperAppointmentNotification(emailData);
}

export async function sendRefereeAppointmentEmail(
  refereeId: number,
  matchdayId: number,
  isCanceled: boolean,
) {
  const refereeData = await db
    .select({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phoneNumber: profile.phoneNumber,
    })
    .from(referee)
    .innerJoin(profile, eq(referee.profileId, profile.id))
    .where(eq(referee.id, refereeId))
    .limit(1);

  invariant(refereeData.length > 0, "Referee not found");
  const refereeProfile = refereeData[0];

  const matchdayInfo = await getMatchdayById(matchdayId);
  invariant(matchdayInfo, "Matchday not found");

  const refereeName = `${refereeProfile.firstName} ${refereeProfile.lastName}`;
  const formattedDate = displayLongDate(toLocalDateTime(matchdayInfo.date));

  const emailData = {
    name: refereeName,
    isCancellation: isCanceled,
    date: formattedDate,
    email: refereeProfile.email,
    phoneNumber: refereeProfile.phoneNumber,
  };

  await sendRefereeAppointmentNotification(emailData);
}
