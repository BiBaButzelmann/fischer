"use server";

import { db } from "@/db/client";
import { profile } from "@/db/schema/profile";
import { setupHelper } from "@/db/schema/setupHelper";
import { referee } from "@/db/schema/referee";
import { getMatchdayById } from "@/db/repositories/match-day";
import {
  sendSetupHelperAppointmentNotification,
  sendRefereeAppointmentNotification,
} from "@/email/appointment";
import { displayLongDate, toLocalDateTime } from "@/lib/date";
import { eq } from "drizzle-orm";
import invariant from "tiny-invariant";

export async function sendSetupHelperAppointmentEmail(
  setupHelperId: number,
  matchdayId: number,
  isCanceled: boolean,
) {
  const setupHelperData = await db.query.setupHelper.findFirst({
    where: eq(setupHelper.id, setupHelperId),
    with: {
      profile: true,
    },
  });

  invariant(setupHelperData, "Setup helper not found");

  const matchdayInfo = await getMatchdayById(matchdayId);
  invariant(matchdayInfo, "Matchday not found");

  const profile = setupHelperData.profile;
  const setupHelperName = `${profile.firstName} ${profile.lastName}`;
  const formattedDate = displayLongDate(toLocalDateTime(matchdayInfo.date));

  const emailData = {
    name: setupHelperName,
    isCancellation: isCanceled,
    date: formattedDate,
    email: profile.email,
    phoneNumber: profile.phoneNumber,
  };

  await sendSetupHelperAppointmentNotification(emailData);
}

export async function sendRefereeAppointmentEmail(
  refereeId: number,
  matchdayId: number,
  isCanceled: boolean,
) {
  const refereeData = await db.query.referee.findFirst({
    where: eq(referee.id, refereeId),
    with: {
      profile: true,
    },
  });

  invariant(refereeData, "Referee not found");

  const matchdayInfo = await getMatchdayById(matchdayId);
  invariant(matchdayInfo, "Matchday not found");

  const profile = refereeData.profile;
  const refereeName = `${profile.firstName} ${profile.lastName}`;
  const formattedDate = displayLongDate(toLocalDateTime(matchdayInfo.date));

  const emailData = {
    name: refereeName,
    isCancellation: isCanceled,
    date: formattedDate,
    email: profile.email,
    phoneNumber: profile.phoneNumber,
  };

  await sendRefereeAppointmentNotification(emailData);
}
