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

export const saveGroups = action(
  async (tournamentId: number, groupsData: GridGroup[]) => {
    console.log(groupsData[0].id, groupsData[0].participants);
    const session = await authWithRedirect();
    invariant(session?.user.role === "admin", "Unauthorized");

    const groupIdsToBeDeleted = groupsData
      .filter((g) => g.isDeleted)
      .map((g) => g.id);
    const groupsToBeUpserted = groupsData.filter((g) => !g.isDeleted);

    await db.transaction(async (tx) => {
      if (groupIdsToBeDeleted.length > 0) {
        await deleteGroups(tx, groupIdsToBeDeleted);
      }
      if (groupsToBeUpserted.length > 0) {
        await upsertGroups(tx, tournamentId, groupsToBeUpserted);
      }
    });

    revalidatePath("/admin/gruppen");
    revalidatePath("/admin/paarungen");
    revalidatePath("/partien");
    revalidatePath("/kalender");
  },
);

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
async function deleteGroups(db: Transaction, groupIds: number[]) {
  await db.delete(group).where(inArray(group.id, groupIds));
  await db
    .delete(participantGroup)
    .where(inArray(participantGroup.groupId, groupIds));
  await db
    .delete(groupMatchEnteringHelper)
    .where(inArray(groupMatchEnteringHelper.groupId, groupIds));

  const gamesToDelete = await db.query.game.findMany({
    where: inArray(game.groupId, groupIds),
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
  await db.delete(game).where(inArray(game.groupId, groupIds));
}

async function upsertGroups(
  db: Transaction,
  tournamentId: number,
  groups: GridGroup[],
) {
  const insertedGroups = await db
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
  const groupIds = insertedGroups.map((g) => g.id);

  console.log("new", groupIds);

  await db
    .delete(groupMatchEnteringHelper)
    .where(inArray(groupMatchEnteringHelper.groupId, groupIds));
  await db
    .delete(participantGroup)
    .where(inArray(participantGroup.groupId, groupIds));

  type GroupMatchEnteringHelperInsert =
    typeof groupMatchEnteringHelper.$inferInsert;
  const matchEnteringHelperValues: GroupMatchEnteringHelperInsert[] =
    groups.flatMap((g, index) =>
      g.matchEnteringHelpers.map((h) => ({
        groupId: groupIds[index],
        matchEnteringHelperId: h.id,
      })),
    );

  type ParticipantGroupInsert = typeof participantGroup.$inferInsert;
  const participantGroupValues: ParticipantGroupInsert[] = groups.flatMap(
    (g, index) =>
      g.participants.map((p) => ({
        groupId: groupIds[index],
        participantId: p.id,
        groupPosition: index + 1,
      })),
  );

  if (matchEnteringHelperValues.length > 0) {
    await db.insert(groupMatchEnteringHelper).values(matchEnteringHelperValues);
  }
  if (participantGroupValues.length > 0) {
    await db.insert(participantGroup).values(participantGroupValues);
  }
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

export async function getExistingGroupNumbers(tournamentId: number) {
  const session = await authWithRedirect();
  invariant(session?.user.role === "admin", "Unauthorized");

  const groups = await db.query.group.findMany({
    where: eq(group.tournamentId, tournamentId),
    columns: { groupNumber: true },
  });

  return groups.map((g) => g.groupNumber);
}
