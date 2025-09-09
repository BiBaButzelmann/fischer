"use server";

import { db } from "@/db/client";
import { matchday } from "@/db/schema/matchday";
import { profile } from "@/db/schema/profile";
import { setupHelper } from "@/db/schema/setupHelper";
import { sendSetupHelperAppointmentNotification } from "@/email/setupHelperAppointment";
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

  const matchdayData = await db
    .select({
      date: matchday.date,
    })
    .from(matchday)
    .where(eq(matchday.id, matchdayId))
    .limit(1);

  invariant(matchdayData.length > 0, "Matchday not found");
  const matchdayInfo = matchdayData[0];

  const setupHelperName = `${setupHelperProfile.firstName} ${setupHelperProfile.lastName}`;
  const formattedDate = displayLongDate(toLocalDateTime(matchdayInfo.date));

  const emailData = {
    setupHelperName,
    isCancellation: isCanceled,
    date: formattedDate,
    email: setupHelperProfile.email,
    phoneNumber: setupHelperProfile.phoneNumber,
  };

  await sendSetupHelperAppointmentNotification(emailData);
}
