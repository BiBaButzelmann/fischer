"use server";

import { db } from "../client";
import { matchday, matchdaySetupHelper } from "../schema/matchday";
import { and, eq, gte, asc } from "drizzle-orm";
import { getCurrentLocalDateTime } from "@/lib/date";

export async function getUpcomingSetupHelperAppointmentsBySetupHelperId(
  setupHelperId: number,
) {
  return await db
    .select({
      matchdayId: matchday.id,
      date: matchday.date,
      dayOfWeek: matchday.dayOfWeek,
      tournamentId: matchday.tournamentId,
      canceled: matchdaySetupHelper.canceled,
    })
    .from(matchdaySetupHelper)
    .innerJoin(matchday, eq(matchday.id, matchdaySetupHelper.matchdayId))
    .where(
      and(
        eq(matchdaySetupHelper.setupHelperId, setupHelperId),
        gte(matchday.date, getCurrentLocalDateTime().toJSDate()),
      ),
    )
    .orderBy(asc(matchday.date));
}
