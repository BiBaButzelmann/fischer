"use server";

import { authWithRedirect } from "@/auth/utils";
import { and, count, eq, inArray, or } from "drizzle-orm";
import { db } from "../client";
import { game } from "../schema/game";
import { gamePostponement } from "../schema/gamePostponement";
import { juror } from "../schema/juror";
import { matchEnteringHelper } from "../schema/matchEnteringHelper";
import { participant } from "../schema/participant";
import { referee } from "../schema/referee";
import { setupHelper } from "../schema/setupHelper";
import { trainer } from "../schema/trainer";
import { tournament } from "../schema/tournament";
import { profile } from "../schema/profile";
import { getProfileByUserId } from "./profile";
import { user } from "../schema/auth";
import { getCurrentLocalDateTime } from "@/lib/date";
import { computeForfeitResults } from "@/lib/forfeit";
import { getTournamentById } from "./tournament";
import { tournamentRoleTables } from "../tournament-role-tables";
import type { GameResult } from "../types/game";

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function isTournamentFinished(tournamentId: number) {
  const found = await getTournamentById(tournamentId);
  return found == null || found.stage === "done";
}

async function setTournamentRolesDeletedAt(
  tx: Transaction,
  profileId: number,
  tournamentId: number,
  deletedAt: Date | null,
) {
  for (const table of tournamentRoleTables) {
    await tx
      .update(table)
      .set({ deletedAt })
      .where(
        and(
          eq(table.profileId, profileId),
          eq(table.tournamentId, tournamentId),
        ),
      );
  }
}

async function applyForfeits(tx: Transaction, tournamentId: number) {
  const games = await tx.query.game.findMany({
    where: eq(game.tournamentId, tournamentId),
    columns: { id: true, result: true },
    with: {
      whiteParticipant: { columns: { deletedAt: true } },
      blackParticipant: { columns: { deletedAt: true } },
    },
  });

  const updates = computeForfeitResults(
    games.map((g) => ({
      id: g.id,
      result: g.result,
      whiteDeactivated: g.whiteParticipant.deletedAt != null,
      blackDeactivated: g.blackParticipant.deletedAt != null,
    })),
  );

  const gameIdsByResult = new Map<GameResult, number[]>();
  for (const { gameId, result } of updates) {
    gameIdsByResult.set(result, [
      ...(gameIdsByResult.get(result) ?? []),
      gameId,
    ]);
  }

  for (const [result, gameIds] of gameIdsByResult) {
    await tx.update(game).set({ result }).where(inArray(game.id, gameIds));
  }
}

export async function softDeleteUser(userId: string, tournamentId: number) {
  const session = await authWithRedirect();
  if (session.user.role !== "admin") {
    return {
      success: false,
      reason: "Nur Admins können Profile löschen",
    };
  }
  const profileData = await getProfileByUserId(userId);
  if (!profileData) {
    return {
      success: false,
      reason: "Profil nicht gefunden",
    };
  }
  if (await isTournamentFinished(tournamentId)) {
    return {
      success: false,
      reason: "Das Turnier ist abgeschlossen",
    };
  }
  const deletedAt = getCurrentLocalDateTime().toJSDate();

  return await db.transaction(async (tx) => {
    await setTournamentRolesDeletedAt(
      tx,
      profileData.id,
      tournamentId,
      deletedAt,
    );
    await applyForfeits(tx, tournamentId);
    return { success: true, deletedAt };
  });
}

export async function hardDeleteUser(userId: string) {
  const session = await authWithRedirect();
  if (session.user.role !== "admin") {
    return {
      success: false,
      reason: "Nur Admins können Profile löschen",
    };
  }

  const profileData = await getProfileByUserId(userId);
  if (!profileData) {
    return {
      success: false,
      reason: "Profil nicht gefunden",
    };
  }
  const { id: profileId } = profileData;

  const [gamePostponementCount] = await db
    .select({ count: count() })
    .from(gamePostponement)
    .where(eq(gamePostponement.postponedByProfileId, profileId));

  if (gamePostponementCount.count > 0) {
    return {
      success: false,
      reason: `Profil kann nicht gelöscht werden: ${gamePostponementCount.count} Spielverlegung(en) existieren für dieses Profil`,
    };
  }

  const [tournamentCount] = await db
    .select({ count: count() })
    .from(tournament)
    .where(eq(tournament.organizerProfileId, profileId));

  if (tournamentCount.count > 0) {
    return {
      success: false,
      reason: `Profil kann nicht gelöscht werden: ${tournamentCount.count} Turnier(e) werden von diesem Profil organisiert`,
    };
  }

  const [participantGameCount] = await db
    .select({ count: count() })
    .from(game)
    .leftJoin(
      participant,
      or(
        eq(game.whiteParticipantId, participant.id),
        eq(game.blackParticipantId, participant.id),
      ),
    )
    .where(eq(participant.profileId, profileId));

  if (participantGameCount.count > 0) {
    return {
      success: false,
      reason: `Profil kann nicht gelöscht werden: Teilnehmer ist an ${participantGameCount.count} Spiel(en) beteiligt`,
    };
  }

  return await db.transaction(async (tx) => {
    await tx.delete(juror).where(eq(juror.profileId, profileId));
    await tx.delete(referee).where(eq(referee.profileId, profileId));
    await tx.delete(setupHelper).where(eq(setupHelper.profileId, profileId));
    await tx.delete(trainer).where(eq(trainer.profileId, profileId));
    await tx
      .delete(matchEnteringHelper)
      .where(eq(matchEnteringHelper.profileId, profileId));
    await tx.delete(participant).where(eq(participant.profileId, profileId));
    await tx.delete(profile).where(eq(profile.id, profileId));
    await tx.delete(user).where(eq(user.id, userId));
    return { success: true, deletedAt: getCurrentLocalDateTime() };
  });
}

export async function restoreUser(userId: string, tournamentId: number) {
  const session = await authWithRedirect();
  if (session.user.role !== "admin") {
    return {
      success: false,
      reason: "Nur Admins können Profile wiederherstellen",
    };
  }

  const profileData = await getProfileByUserId(userId);
  if (!profileData) {
    return {
      success: false,
      reason: "Profil nicht gefunden",
    };
  }
  if (await isTournamentFinished(tournamentId)) {
    return {
      success: false,
      reason: "Das Turnier ist abgeschlossen",
    };
  }

  return await db.transaction(async (tx) => {
    await setTournamentRolesDeletedAt(tx, profileData.id, tournamentId, null);
    return { success: true, restoredAt: getCurrentLocalDateTime() };
  });
}
