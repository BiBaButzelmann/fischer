"use server";

import { db } from "@/db/client";
import { participantGroup } from "@/db/schema/participant";
import { ParticipantWithName } from "@/db/types/participant";
import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { GridGroup } from "@/components/admin/groups/types";
import { group } from "@/db/schema/group";
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
    await tx.delete(participantGroup).where(
      inArray(
        participantGroup.groupId,
        deletedGroups.map((g) => g.id),
      ),
    );

    const insertGroupValues = groups.map(
      (g) =>
        ({
          groupName: g.groupName,
          groupNumber: g.groupNumber,
          dayOfWeek: g.dayOfWeek,
          tournamentId,
        }) as typeof group.$inferInsert,
    );
    const insertedGroups = await tx
      .insert(group)
      .values(insertGroupValues)
      .returning();

    const insertParticipantGroupValues = groups.flatMap((g, groupIndex) =>
      g.participants.map((p, index) => ({
        participantId: p.id,
        groupId: insertedGroups[groupIndex].id,
        groupPosition: index + 1,
      })),
    );
    await tx.insert(participantGroup).values(insertParticipantGroupValues);
  });

  revalidatePath("/admin/gruppen");
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
