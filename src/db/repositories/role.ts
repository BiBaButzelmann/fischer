"use server";

import { eq, sql } from "drizzle-orm";
import { db } from "../client";
import { participant } from "../schema/participant";
import { unionAll } from "drizzle-orm/pg-core";
import { referee } from "../schema/referee";
import { juror } from "../schema/juror";
import { matchEnteringHelper } from "../schema/matchEnteringHelper";
import { setupHelper } from "../schema/setupHelper";
import { trainer } from "../schema/trainer";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { Role, RolesData } from "../types/role";
import { getProfileByUserId } from "./profile";
import { getJurorByProfileIdAndTournamentId } from "./juror";
import { getMatchEnteringHelperByProfileIdAndTournamentId } from "./match-entering-helper";
import { getParticipantByProfileIdAndTournamentId } from "./participant";
import { getRefereeByProfileIdAndTournamentId } from "./referee";
import { getSetupHelperByProfileIdAndTournamentId } from "./setup-helper";
import { getTrainerByProfileIdAndTournamentId } from "./trainer";

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
  const trainerQuery = db
    .select({ tableName: sql<Role>`'trainer'::text`.as("tableName") })
    .from(trainer)
    .where(eq(trainer.profileId, profileId));

  const [unionResult, sessionResult] = await Promise.all([
    unionAll(
      participantQuery,
      refereeQuery,
      jurorQuery,
      matchEnteringHelperQuery,
      setupHelperQuery,
      trainerQuery,
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

export async function getRolesByUserId(userId: string) {
  const profile = await getProfileByUserId(userId);
  if (!profile) {
    return [];
  }
  return getRolesByProfileId(profile.id);
}

export async function getRolesDataByProfileIdAndTournamentId(
  profileId: number,
  tournamentId: number,
): Promise<RolesData> {
  const [participant, referee, matchEnteringHelper, setupHelper, juror, trainer] =
    await Promise.all([
      getParticipantByProfileIdAndTournamentId(profileId, tournamentId),
      getRefereeByProfileIdAndTournamentId(profileId, tournamentId),
      getMatchEnteringHelperByProfileIdAndTournamentId(profileId, tournamentId),
      getSetupHelperByProfileIdAndTournamentId(profileId, tournamentId),
      getJurorByProfileIdAndTournamentId(profileId, tournamentId),
      getTrainerByProfileIdAndTournamentId(profileId, tournamentId),
    ]);

  return {
    participant: participant ?? undefined,
    referee: referee ?? undefined,
    matchEnteringHelper: matchEnteringHelper ?? undefined,
    setupHelper: setupHelper ?? undefined,
    juror: juror ?? undefined,
    trainer: trainer ?? undefined,
  };
}
