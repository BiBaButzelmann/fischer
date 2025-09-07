"use server";

import { db } from "@/db/client";
import { participantGroup } from "@/db/schema/participant";
import { ParticipantWithName } from "@/db/types/participant";
import { and, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { GridGroup } from "@/components/admin/groups/types";
import { group } from "@/db/schema/group";
import { game } from "@/db/schema/game";
import { pgn } from "@/db/schema/pgn";
import { gamePostponement } from "@/db/schema/gamePostponement";
import { matchdayGame } from "@/db/schema/matchday";
import { groupMatchEnteringHelper } from "@/db/schema/matchEnteringHelper";
import { authWithRedirect } from "@/auth/utils";
import invariant from "tiny-invariant";
import { action } from "@/lib/actions";
import { DayOfWeek } from "@/db/types/group";

export const saveGroups = action(
  async (tournamentId: number, groupsData: GridGroup[]) => {
    const session = await authWithRedirect();
    invariant(session?.user.role === "admin", "Unauthorized");

    const groupIdsToBeDeleted = groupsData
      .filter((g) => g.isDeleted)
      .map((g) => g.id);

    const newGroups = groupsData.filter((g) => g.isNew && !g.isDeleted);
    const existingGroups = groupsData.filter((g) => !g.isNew && !g.isDeleted);
    const nonDeletedGroups = groupsData.filter((g) => !g.isDeleted);

    await db.transaction(async (tx) => {
      if (groupIdsToBeDeleted.length > 0) {
        await deleteGroups(tx, groupIdsToBeDeleted);
      }

      for (const group of existingGroups) {
        if (group.isNew) {
          continue;
        }

        const participantsChanged = await hasParticipantsChanged(
          tx,
          group.id!,
          group.participants.map((p) => p.id),
        );
        const matchdayChanged = await hasMatchdayChanged(
          tx,
          group.id!,
          group.dayOfWeek,
        );

        if (matchdayChanged) {
          await deleteGroupMatchEnteringHelpers(tx, group.id!);
          await deleteGroupGames(tx, group.id!);
        }

        if (participantsChanged) {
          await deleteGroupParticipants(tx, group.id!);
          await deleteGroupGames(tx, group.id!);
          await insertGroupParticipants(
            tx,
            group.id!,
            group.participants.map((p) => p.id),
          );
        }
      }

      let insertedGroups: { id: number }[] = [];
      if (nonDeletedGroups.length > 0) {
        insertedGroups = await upsertGroups(tx, tournamentId, nonDeletedGroups);
      }

      if (newGroups.length > 0) {
        for (let i = 0; i < newGroups.length; i++) {
          const newGroup = newGroups[i];
          const insertedGroup = insertedGroups[i];
          await insertGroupParticipants(
            tx,
            insertedGroup.id!,
            newGroup.participants.map((p) => p.id),
          );
          await insertGroupMatchEnteringHelpers(
            tx,
            insertedGroup.id!,
            newGroup.matchEnteringHelpers.map((m) => m.id),
          );
        }
      }
    });

    revalidatePath("/admin/gruppen");
    revalidatePath("/admin/paarungen");
    revalidatePath("/partien");
    revalidatePath("/kalender");
  },
);

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function hasParticipantsChanged(
  db: Transaction,
  groupId: number,
  newParticipantIds: number[],
) {
  const participants = await db.query.participantGroup.findMany({
    where: eq(participantGroup.groupId, groupId),
    columns: { participantId: true },
  });
  const participantIds = participants.map((p) => p.participantId);

  const differentLength = participantIds.length !== newParticipantIds.length;
  const sameIds = participantIds.every((id) => newParticipantIds.includes(id));
  return differentLength || !sameIds;
}

async function hasMatchdayChanged(
  db: Transaction,
  groupId: number,
  newDayOfWeek: DayOfWeek | null,
) {
  const currentDayOfWeek = await db.query.group.findFirst({
    where: eq(group.id, groupId),
    columns: { dayOfWeek: true },
  });
  return currentDayOfWeek?.dayOfWeek !== newDayOfWeek;
}

async function deleteGroups(db: Transaction, groupIds: number[]) {
  await db.delete(group).where(inArray(group.id, groupIds));
  await db
    .delete(participantGroup)
    .where(inArray(participantGroup.groupId, groupIds));
  await db
    .delete(groupMatchEnteringHelper)
    .where(inArray(groupMatchEnteringHelper.groupId, groupIds));

  for (const groupId of groupIds) {
    await deleteGroupGames(db, groupId);
  }
}

async function deleteGroupGames(db: Transaction, groupId: number) {
  const gamesToDelete = await db.query.game.findMany({
    where: eq(game.groupId, groupId),
    columns: { id: true },
  });
  const gameIds = gamesToDelete.map((g: { id: number }) => g.id);
  if (gameIds.length === 0) {
    return;
  }

  await db
    .delete(gamePostponement)
    .where(inArray(gamePostponement.gameId, gameIds));
  await db.delete(matchdayGame).where(inArray(matchdayGame.gameId, gameIds));
  await db.delete(pgn).where(inArray(pgn.gameId, gameIds));
  await db.delete(game).where(eq(game.groupId, groupId));
}

async function deleteGroupParticipants(db: Transaction, groupId: number) {
  await db
    .delete(participantGroup)
    .where(eq(participantGroup.groupId, groupId));
}

async function deleteGroupMatchEnteringHelpers(
  db: Transaction,
  groupId: number,
) {
  await db
    .delete(groupMatchEnteringHelper)
    .where(eq(groupMatchEnteringHelper.groupId, groupId));
}

async function upsertGroups(
  db: Transaction,
  tournamentId: number,
  groups: GridGroup[],
) {
  return await db
    .insert(group)
    .values(
      groups.map(({ groupName, groupNumber, dayOfWeek }) => ({
        tournamentId,
        groupName,
        groupNumber,
        dayOfWeek,
      })),
    )
    .onConflictDoUpdate({
      target: [group.tournamentId, group.groupNumber],
      set: {
        groupName: sql.raw(`excluded.${group.groupName.name}`),
        groupNumber: sql.raw(`excluded.${group.groupNumber.name}`),
        dayOfWeek: sql.raw(`excluded.${group.dayOfWeek.name}`),
      },
    })
    .returning();
}

async function insertGroupMatchEnteringHelpers(
  db: Transaction,
  groupId: number,
  matchEnteringHelperIds: number[],
) {
  if (matchEnteringHelperIds.length === 0) {
    return;
  }

  await db.insert(groupMatchEnteringHelper).values(
    matchEnteringHelperIds.map((id) => ({
      groupId,
      matchEnteringHelperId: id,
    })),
  );
}

async function insertGroupParticipants(
  db: Transaction,
  groupId: number,
  participantIds: number[],
) {
  if (participantIds.length === 0) {
    return;
  }

  await db.insert(participantGroup).values(
    participantIds.map((id, index) => ({
      groupId,
      participantId: id,
      groupPosition: index + 1,
    })),
  );
}

export async function updateGroupPositions(
  groupId: number,
  participants: ParticipantWithName[],
) {
  const session = await authWithRedirect();
  invariant(session?.user.role === "admin", "Unauthorized");

  await db.transaction(async (tx) => {
    await tx
      .delete(participantGroup)
      .where(and(eq(participantGroup.groupId, groupId)));

    await tx.insert(participantGroup).values(
      participants.map((p, index) => ({
        participantId: p.id,
        groupId,
        groupPosition: index + 1,
      })),
    );
  });

  revalidatePath("/admin/gruppen");
  revalidatePath("/admin/paarungen");
}
