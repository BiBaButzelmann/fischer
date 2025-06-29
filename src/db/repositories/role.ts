"use server";

import { eq, sql } from "drizzle-orm";
import { db } from "../client";
import { participant } from "../schema/participant";
import { unionAll } from "drizzle-orm/pg-core";
import { referee } from "../schema/referee";
import { juror } from "../schema/juror";
import { matchEnteringHelper } from "../schema/matchEnteringHelper";
import { setupHelper } from "../schema/setupHelper";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { Role } from "../types/role";

// TODO: should we add admin here?
export async function getRolesByProfileId(profileId: number): Promise<Role[]> {
  const participantQuery = db
    .select({ tableName: sql<Role>`'participant'::text`.as("tableName") })
    .from(participant)
    .where(eq(participant.profileId, profileId));
  const refereeQuery = db
    .select({ tableName: sql<Role>`'referee'::text`.as("tableName") })
    .from(referee)
    .where(eq(referee.profileId, profileId));
  const jurorQuery = db
    .select({ tableName: sql<Role>`'juror'::text`.as("tableName") })
    .from(juror)
    .where(eq(juror.profileId, profileId));
  const matchEnteringHelperQuery = db
    .select({
      tableName: sql<Role>`'matchEnteringHelper'::text`.as("tableName"),
    })
    .from(matchEnteringHelper)
    .where(eq(matchEnteringHelper.profileId, profileId));
  const setupHelperQuery = db
    .select({ tableName: sql<Role>`'setupHelper'::text`.as("tableName") })
    .from(setupHelper)
    .where(eq(setupHelper.profileId, profileId));

  const [unionResult, sessionResult] = await Promise.all([
    unionAll(
      participantQuery,
      refereeQuery,
      jurorQuery,
      matchEnteringHelperQuery,
      setupHelperQuery,
    ),
    auth.api.getSession({
      headers: await headers(),
    }),
  ]);

  return [
    ...unionResult.map((row) => row.tableName),
    ...(sessionResult?.user.role === "admin" ? (["admin"] as const) : []),
  ];
}
