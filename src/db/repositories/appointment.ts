"use server";

import { db } from "../client";
import {
  matchday,
  matchdayReferee,
  matchdaySetupHelper,
} from "../schema/matchday";
import { referee } from "../schema/referee";
import { setupHelper } from "../schema/setupHelper";
import { profile as profileSchema } from "../schema/profile";
import { and, eq, gte, asc, ne, inArray } from "drizzle-orm";

export async function getRefereeAppointmentsByRefereeId(
  refereeId: number,
  fromDate: Date,
) {
  return db
    .select({
      matchdayId: matchday.id,
      date: matchday.date,
      dayOfWeek: matchday.dayOfWeek,
      tournamentId: matchday.tournamentId,
      canceled: matchdayReferee.canceled,
    })
    .from(matchdayReferee)
    .innerJoin(matchday, eq(matchday.id, matchdayReferee.matchdayId))
    .where(
      and(eq(matchdayReferee.refereeId, refereeId), gte(matchday.date, fromDate)),
    )
    .orderBy(asc(matchday.date));
}

export async function getSetupHelperAppointmentsBySetupHelperId(
  setupHelperId: number,
  fromDate: Date,
) {
  return db
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
        gte(matchday.date, fromDate),
      ),
    )
    .orderBy(asc(matchday.date));
}

export async function getRefereeInfoByMatchdayIds(matchdayIds: number[]) {
  return db
    .select({
      matchdayId: matchdayReferee.matchdayId,
      firstName: profileSchema.firstName,
      lastName: profileSchema.lastName,
      email: profileSchema.email,
      phoneNumber: profileSchema.phoneNumber,
      canceled: matchdayReferee.canceled,
    })
    .from(matchdayReferee)
    .innerJoin(referee, eq(matchdayReferee.refereeId, referee.id))
    .innerJoin(profileSchema, eq(referee.profileId, profileSchema.id))
    .where(inArray(matchdayReferee.matchdayId, matchdayIds));
}

export async function getSetupHelpersInfoByMatchdayIds(
  matchdayIds: number[],
  excludeProfileId: number,
) {
  return db
    .select({
      matchdayId: matchdaySetupHelper.matchdayId,
      firstName: profileSchema.firstName,
      lastName: profileSchema.lastName,
      email: profileSchema.email,
      phoneNumber: profileSchema.phoneNumber,
      canceled: matchdaySetupHelper.canceled,
    })
    .from(matchdaySetupHelper)
    .innerJoin(setupHelper, eq(matchdaySetupHelper.setupHelperId, setupHelper.id))
    .innerJoin(profileSchema, eq(setupHelper.profileId, profileSchema.id))
    .where(
      and(
        inArray(matchdaySetupHelper.matchdayId, matchdayIds),
        ne(profileSchema.id, excludeProfileId),
      ),
    );
}
