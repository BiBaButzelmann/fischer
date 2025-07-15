"use server";

import { db } from "@/db/client";
import { participant } from "@/db/schema/participant";
import { MatchDay } from "@/db/types/group";
import { ParticipantWithName } from "@/db/types/participant";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { GridGroup } from "@/components/admin/groups/types";
import { group } from "@/db/schema/group";
import { authWithRedirect } from "@/auth/utils";
import { getTournamentById } from "@/db/repositories/tournament";
import invariant from "tiny-invariant";
import { getParticipantsByTournamentId } from "@/db/repositories/participant";

// TODO: find out why revalidatePath doesn't work here
export async function generateGroups(tournamentId: number) {
  const session = await authWithRedirect();
  invariant(session?.user.role === "admin", "Unauthorized");

  const tournament = await getTournamentById(tournamentId);
  invariant(tournament != null, "Tournament not found");

  const participants = await getParticipantsByTournamentId(tournamentId);
  invariant(
    participants.length > 0,
    "No participants found for this tournament",
  );

  const { participantGroups } = getParticipantsGroupDistribution(
    tournament.numberOfRounds + 1,
    participants,
  );

  console.log("Participant groups generated:", participantGroups);

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

export async function updateGroups(
  tournamentId: number,
  groups: GridGroup[],
  unassignedParticipants: ParticipantWithName[],
) {
  const session = await authWithRedirect();
  invariant(session?.user.role === "admin", "Unauthorized");

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
    if (insertGroup.participants.length > 0) {
      await updateGroupPositions(
        tournamentId,
        insertGroup.id,
        insertGroup.participants,
      );
    }
  }

  revalidatePath("/admin/tournament");
}

export async function updateGroupPositions(
  tournamentId: number,
  groupId: number,
  participants: ParticipantWithName[],
) {
  const session = await authWithRedirect();
  invariant(session?.user.role === "admin", "Unauthorized");

  for (const [index, p] of participants.entries()) {
    await db
      .update(participant)
      .set({
        groupId: groupId,
        groupPosition: index + 1,
      })
      .where(
        and(
          eq(participant.tournamentId, tournamentId),
          eq(participant.profileId, p.profileId),
        ),
      );
  }

  revalidatePath("/admin/tournament");
  revalidatePath("/admin/paarungen");
}

export async function updateGroupMatchDay(
  groupId: number,
  matchDay: MatchDay | null,
) {
  const session = await authWithRedirect();
  invariant(session?.user.role === "admin", "Unauthorized");

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
