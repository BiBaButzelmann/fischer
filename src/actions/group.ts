"use server";
// TODO: check if this can be optimized

import { auth } from "@/auth";
import { db } from "@/db/client";
import { participant } from "@/db/schema/participant";
import { MatchDay } from "@/db/types/group";
import { ParticipantWithName } from "@/db/types/participant";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { GridGroup } from "@/components/admin/tournament/types";
import { group } from "@/db/schema/group";

// TODO: find out why revalidatePath doesn't work here
export async function generateGroups(tournamentId: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const tournament = await db.query.tournament.findFirst({
    where: (tournament, { eq }) => eq(tournament.id, tournamentId),
  });

  if (!tournament) {
    throw new Error("Tournament not found");
  }

  const participants = await db.query.participant.findMany({
    where: (participant, { eq }) => eq(participant.tournamentId, tournamentId),
    with: {
      profile: {
        columns: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: (participant, { desc, sql }) => [
      sql`${participant.fideRating} IS NULL`,
      desc(participant.fideRating),
    ],
  });

  if (participants.length === 0) {
    throw new Error("No participants found for this tournament");
  }

  const { participantGroups } = getParticipantsGroupDistribution(
    tournament.numberOfRounds + 1,
    participants,
  );

  for (const [index, participantsInGroup] of participantGroups.entries()) {
    const groupNumber = index + 1;
    const groupName = `Gruppe ${groupNumber}`;

    const insertedGroup = await db
      .insert(group)
      .values({
        groupName,
        groupNumber,
        tournamentId,
      })
      .returning();

    for (const [index, p] of participantsInGroup.entries()) {
      await db
        .update(participant)
        .set({
          groupId: insertedGroup[0].id,
          groupPosition: index + 1,
        })
        .where(
          and(
            eq(participant.tournamentId, tournamentId),
            eq(participant.profileId, p.profileId),
          ),
        );
    }
  }

  revalidatePath("/admin/tournament");
}

// TODO: maybe add flag to only update participant if participant was moved to a different group/position
export async function updateGroups(
  tournamentId: number,
  groups: GridGroup[],
  unassignedParticipants: ParticipantWithName[],
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  for (const unassignedParticipant of unassignedParticipants) {
    await db
      .update(participant)
      .set({
        groupId: null,
        groupPosition: null,
      })
      .where(
        and(
          eq(participant.tournamentId, tournamentId),
          eq(participant.profileId, unassignedParticipant.profileId),
        ),
      );
  }

  for (const insertGroup of groups) {
    for (const [index, p] of insertGroup.participants.entries()) {
      await db
        .update(participant)
        .set({
          groupId: insertGroup.id,
          groupPosition: index + 1,
        })
        .where(
          and(
            eq(participant.tournamentId, tournamentId),
            eq(participant.profileId, p.profileId),
          ),
        );
    }
  }

  revalidatePath("/admin/tournament");
}

export async function updateGroupMatchDay(
  groupId: number,
  matchDay: MatchDay | null,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  await db.update(group).set({ matchDay }).where(eq(group.id, groupId));

  revalidatePath("/admin/tournament");
}

function getParticipantsGroupDistribution(
  groupSize: number,
  participants: ParticipantWithName[],
): {
  participantGroups: ParticipantWithName[][];
  unassignedParticipants: ParticipantWithName[];
} {
  // assume participants are already sorted by fide rating
  const totalGroups = Math.floor(participants.length / groupSize);
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
