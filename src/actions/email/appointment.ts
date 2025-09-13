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
