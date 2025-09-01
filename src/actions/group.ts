"use server";

import { db } from "@/db/client";
import { participantGroup } from "@/db/schema/participant";
import { ParticipantWithName } from "@/db/types/participant";
import { and, eq, inArray, ne } from "drizzle-orm";
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

export async function deleteGroup(groupId: number) {
  const session = await authWithRedirect();
  invariant(session?.user.role === "admin", "Unauthorized");

  await db.transaction(async (tx) => {
    const gamesToDelete = await tx.query.game.findMany({
      where: eq(game.groupId, groupId),
      columns: { id: true },
    });

    const gameIds = gamesToDelete.map((g: { id: number }) => g.id);

    if (gameIds.length > 0) {
      await tx
        .delete(gamePostponement)
        .where(inArray(gamePostponement.gameId, gameIds));

      await tx
        .delete(matchdayGame)
        .where(inArray(matchdayGame.gameId, gameIds));

      await tx.delete(pgn).where(inArray(pgn.gameId, gameIds));

      await tx.delete(game).where(eq(game.groupId, groupId));
    }

    await tx
      .delete(groupMatchEnteringHelper)
      .where(eq(groupMatchEnteringHelper.groupId, groupId));

    await tx
      .delete(participantGroup)
      .where(eq(participantGroup.groupId, groupId));

    await tx.delete(group).where(eq(group.id, groupId));
  });

  revalidatePath("/admin/gruppen");
  revalidatePath("/admin/paarungen");
  revalidatePath("/partien");
  revalidatePath("/kalender");
}

export async function saveGroup(tournamentId: number, groupData: GridGroup) {
  const session = await authWithRedirect();
  invariant(session?.user.role === "admin", "Unauthorized");

  let groupId: number | undefined;

  await db.transaction(async (tx) => {
    if (groupData.isNew) {
      const insertedGroup = await tx
        .insert(group)
        .values({
          groupName: groupData.groupName,
          groupNumber: groupData.groupNumber,
          dayOfWeek: groupData.dayOfWeek,
          tournamentId,
        })
        .returning();

      if (groupData.participants.length > 0) {
        await tx.insert(participantGroup).values(
          groupData.participants.map((p, index) => ({
            participantId: p.id,
            groupId: insertedGroup[0].id,
            groupPosition: index + 1,
          })),
        );
      }

      groupId = insertedGroup[0].id;
    } else {
      const existingGroup = await tx.query.group.findFirst({
        where: eq(group.id, groupData.id),
      });

      if (!existingGroup) {
        throw new Error(`Group ${groupData.id} not found`);
      }

      const gamesToDelete = await tx.query.game.findMany({
        where: eq(game.groupId, groupData.id),
        columns: { id: true },
      });

      const gameIds = gamesToDelete.map((g: { id: number }) => g.id);

      if (gameIds.length > 0) {
        await tx
          .delete(gamePostponement)
          .where(inArray(gamePostponement.gameId, gameIds));

        await tx
          .delete(matchdayGame)
          .where(inArray(matchdayGame.gameId, gameIds));

        await tx.delete(pgn).where(inArray(pgn.gameId, gameIds));

        await tx.delete(game).where(eq(game.groupId, groupData.id));
      }

      await tx
        .delete(groupMatchEnteringHelper)
        .where(eq(groupMatchEnteringHelper.groupId, groupData.id));

      await tx
        .delete(participantGroup)
        .where(eq(participantGroup.groupId, groupData.id));

      await tx
        .update(group)
        .set({
          groupName: groupData.groupName,
          groupNumber: groupData.groupNumber,
          dayOfWeek: groupData.dayOfWeek,
        })
        .where(eq(group.id, groupData.id));

      if (groupData.participants.length > 0) {
        await tx.insert(participantGroup).values(
          groupData.participants.map((p, index) => ({
            participantId: p.id,
            groupId: groupData.id,
            groupPosition: index + 1,
          })),
        );
      }

      groupId = existingGroup.id;
    }
  });

  invariant(groupId, "Group ID should be defined after saving the group");

  revalidatePath("/admin/gruppen");
  revalidatePath("/admin/paarungen");
  revalidatePath("/partien");
  revalidatePath("/kalender");

  return groupId;
}

export async function updateGroupName(groupId: number, newName: string) {
  const session = await authWithRedirect();
  invariant(session?.user.role === "admin", "Unauthorized");

  await db
    .update(group)
    .set({ groupName: newName })
    .where(eq(group.id, groupId));

  revalidatePath("/admin/gruppen");
  revalidatePath("/admin/paarungen");
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
