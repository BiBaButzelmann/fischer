"use server";

import { db } from "@/db/client";
import { participant, participantGroup } from "@/db/schema/participant";
import { DayOfWeek } from "@/db/types/group";
import { ParticipantWithName } from "@/db/types/participant";
import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { GridGroup } from "@/components/admin/groups/types";
import { group } from "@/db/schema/group";
import { authWithRedirect } from "@/auth/utils";
import { getTournamentById } from "@/db/repositories/tournament";
import invariant from "tiny-invariant";
import { getParticipantsByTournamentId } from "@/db/repositories/participant";
import { tournament } from "@/db/schema/tournament";

export async function generateGroups(tournamentId: number) {
  const session = await authWithRedirect();
  invariant(session?.user.role === "admin", "Unauthorized");

  // const tournament = await getTournamentById(tournamentId);
  // invariant(tournament != null, "Tournament not found");

  // const participants = await getParticipantsByTournamentId(tournamentId);
  // invariant(
  //   participants.length > 0,
  //   "No participants found for this tournament",
  // );

  // const { participantGroups } = getParticipantsGroupDistribution(
  //   tournament.numberOfRounds + 1,
  //   participants,
  // );

  // for (const [index, participantsInGroup] of participantGroups.entries()) {
  //   const groupNumber = index + 1;
  //   const groupName = `Gruppe ${groupNumber}`;

  //   const insertedGroup = await db
  //     .insert(group)
  //     .values({
  //       groupName,
  //       groupNumber,
  //       tournamentId,
  //     })
  //     .returning();

  //   for (const [index, p] of participantsInGroup.entries()) {
  //     await db
  //       .update(participant)
  //       .set({
  //         groupId: insertedGroup[0].id,
  //         groupPosition: index + 1,
  //       })
  //       .where(
  //         and(
  //           eq(participant.tournamentId, tournamentId),
  //           eq(participant.profileId, p.profileId),
  //         ),
  //       );
  //   }
  // }

  revalidatePath("/admin/gruppen");
}

export async function updateGroups(tournamentId: number, groups: GridGroup[]) {
  const session = await authWithRedirect();
  invariant(session?.user.role === "admin", "Unauthorized");

  // TODO: remove group id + group position from participants
  console.log("starting group update for tournament", tournamentId);

  await db.transaction(async (tx) => {
    // clear existing groups and participant associations
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

    // insert new groups
    const insertGroupValues = groups.map(
      (g) =>
        ({
          groupName: g.groupName,
          groupNumber: g.groupNumber,
          matchDay: g.matchDay,
          tournamentId,
        }) as typeof group.$inferInsert,
    );
    const insertedGroups = await tx
      .insert(group)
      .values(insertGroupValues)
      .returning();
    console.log("inserted groups", insertedGroups);

    // insert participant associations
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
  tournamentId: number,
  groupId: number,
  participants: ParticipantWithName[],
) {
  // const session = await authWithRedirect();
  // invariant(session?.user.role === "admin", "Unauthorized");

  // for (const [index, p] of participants.entries()) {
  //   await db
  //     .update(participant)
  //     .set({
  //       groupId: groupId,
  //       groupPosition: index + 1,
  //     })
  //     .where(
  //       and(
  //         eq(participant.tournamentId, tournamentId),
  //         eq(participant.profileId, p.profileId),
  //       ),
  //     );
  // }

  revalidatePath("/admin/gruppen");
  revalidatePath("/admin/paarungen");
}

function getParticipantsGroupDistribution(
  groupSize: number,
  participants: ParticipantWithName[],
): {
  participantGroups: ParticipantWithName[][];
  unassignedParticipants: ParticipantWithName[];
} {
  // assume participants are already sorted by fide rating
  const totalGroups = Math.ceil(participants.length / groupSize);
  const totalAssignable = totalGroups * groupSize;

  const participantGroups: ParticipantWithName[][] = [];
  for (let i = 0; i < totalAssignable; i += groupSize) {
    participantGroups.push(participants.slice(i, i + groupSize));
  }

  const unassignedParticipants = participants.slice(totalAssignable);

  return {
    participantGroups,
    unassignedParticipants,
  };
}
