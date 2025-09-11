"use server";

import { db } from "@/db/client";
import { participantGroup } from "@/db/schema/participant";
import { ParticipantWithName } from "@/db/types/participant";
import { and, eq, inArray } from "drizzle-orm";
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
    const session = await authWithRedirect();
    invariant(session?.user.role === "admin", "Unauthorized");

    const groupsToDelete = groupsData.filter((g) => g.isDeleted);
    const groupsToInsert = groupsData.filter((g) => g.isNew && !g.isDeleted);
    const groupsToUpdate = groupsData.filter((g) => !g.isNew && !g.isDeleted);

    await db.transaction(async (tx) => {
      if (groupsToDelete.length > 0) {
        await deleteGroups(tx, groupsToDelete);
      }

      for (const groupToInsert of groupsToInsert) {
        await createGroup(tx, tournamentId, groupToInsert);
      }

      for (const groupToUpdate of groupsToUpdate) {
        await updateGroup(tx, tournamentId, groupToUpdate);
      }
    });

    revalidatePath("/admin/gruppen");
    revalidatePath("/admin/paarungen");
    revalidatePath("/partien");
    revalidatePath("/kalender");
  },
);

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function createGroup(
  db: Transaction,
  tournamentId: number,
  groupData: GridGroup,
) {
  const insertedGroup = await insertGroup(db, tournamentId, groupData);
  await insertGroupParticipants(
    db,
    insertedGroup.id!,
    groupData.participants.map((p) => p.id),
  );
  await insertGroupMatchEnteringHelpers(
    db,
    insertedGroup.id!,
    groupData.matchEnteringHelpers.map((m) => m.id),
  );
}

async function updateGroup(
  db: Transaction,
  tournamentId: number,
  groupData: GridGroup,
) {
  const existingGroupInDb = await db.query.group.findFirst({
    where: and(
      eq(group.id, groupData.id),
      eq(group.tournamentId, tournamentId),
    ),
    with: {
      participants: true,
      matchEnteringHelpers: true,
    },
  });
  invariant(existingGroupInDb, "Group not found");

  await db
    .update(group)
    .set({
      groupName: groupData.groupName,
      groupNumber: groupData.groupNumber,
      dayOfWeek: groupData.dayOfWeek,
    })
    .where(eq(group.id, groupData.id));

  const matchEnteringHelpersChanged = hasMatchEnteringHelpersChanged(
    existingGroupInDb.matchEnteringHelpers.map((m) => m.matchEnteringHelperId),
    groupData.matchEnteringHelpers.map((m) => m.id),
  );

  if (matchEnteringHelpersChanged) {
    await deleteGroupMatchEnteringHelpers(db, groupData.id);
    await insertGroupMatchEnteringHelpers(
      db,
      groupData.id,
      groupData.matchEnteringHelpers.map((m) => m.id),
    );
  }

  const participantsChanged = hasParticipantsChanged(
    existingGroupInDb.participants.map((p) => p.participantId),
    groupData.participants.map((p) => p.id),
  );

  if (participantsChanged) {
    await deleteGroupParticipants(db, groupData.id);
    await insertGroupParticipants(
      db,
      groupData.id,
      groupData.participants.map((p) => p.id),
    );
  }

  const hasMatchdayChanged =
    existingGroupInDb.dayOfWeek !== groupData.dayOfWeek;

  if (participantsChanged || hasMatchdayChanged) {
    await deleteGroupGames(db, groupData.id);
  }
}

function hasParticipantsChanged(
  participantIds: number[],
  newParticipantIds: number[],
) {
  const differentLength = participantIds.length !== newParticipantIds.length;
  const sameIds = participantIds.every((id) => newParticipantIds.includes(id));
  return differentLength || !sameIds;
}

function hasMatchEnteringHelpersChanged(
  helperIds: number[],
  newHelperIds: number[],
) {
  const differentLength = helperIds.length !== newHelperIds.length;
  const sameIds = helperIds.every((id) => newHelperIds.includes(id));
  return differentLength || !sameIds;
}

async function deleteGroups(db: Transaction, groups: GridGroup[]) {
  const groupIds = groups.map((g) => g.id);
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

async function insertGroup(
  db: Transaction,
  tournamentId: number,
  data: GridGroup,
) {
  const [insertedGroup] = await db
    .insert(group)
    .values({
      tournamentId,
      groupName: data.groupName,
      groupNumber: data.groupNumber,
      dayOfWeek: data.dayOfWeek,
    })
    .returning();
  return insertedGroup;
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
