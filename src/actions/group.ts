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

export async function updateGroups(tournamentId: number, groups: GridGroup[]) {
  const session = await authWithRedirect();
  invariant(session?.user.role === "admin", "Unauthorized");

  await db.transaction(async (tx) => {
    const deletedGroups = await tx
      .delete(group)
      .where(eq(group.tournamentId, tournamentId))
      .returning();

    if (deletedGroups.length > 0) {
      const deletedGroupIds = deletedGroups.map((g) => g.id);

      const gamesToDelete = await tx.query.game.findMany({
        where: inArray(game.groupId, deletedGroupIds),
        columns: { id: true },
      });

      const gameIds = gamesToDelete.map((g) => g.id);

      if (gameIds.length > 0) {
        await tx
          .delete(gamePostponement)
          .where(inArray(gamePostponement.gameId, gameIds));

        await tx
          .delete(matchdayGame)
          .where(inArray(matchdayGame.gameId, gameIds));

        await tx.delete(pgn).where(inArray(pgn.gameId, gameIds));

        await tx.delete(game).where(inArray(game.groupId, deletedGroupIds));
      }

      await tx
        .delete(groupMatchEnteringHelper)
        .where(inArray(groupMatchEnteringHelper.groupId, deletedGroupIds));

      await tx
        .delete(participantGroup)
        .where(inArray(participantGroup.groupId, deletedGroupIds));
    }

    const insertGroupValues = groups.map(
      (g) =>
        ({
          groupName: g.groupName,
          groupNumber: g.groupNumber,
          dayOfWeek: g.dayOfWeek,
          tournamentId,
        }) as typeof group.$inferInsert,
    );

    let insertedGroups: { id: number }[] = [];
    if (insertGroupValues.length > 0) {
      insertedGroups = await tx
        .insert(group)
        .values(insertGroupValues)
        .returning();
    }

    const insertParticipantGroupValues = groups.flatMap((g, groupIndex) =>
      g.participants.map((p, index) => ({
        participantId: p.id,
        groupId: insertedGroups[groupIndex].id,
        groupPosition: index + 1,
      })),
    );

    if (insertParticipantGroupValues.length > 0) {
      await tx.insert(participantGroup).values(insertParticipantGroupValues);
    }
  });

  revalidatePath("/admin/gruppen");
  revalidatePath("/admin/paarungen");
  revalidatePath("/partien");
  revalidatePath("/kalender");
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
