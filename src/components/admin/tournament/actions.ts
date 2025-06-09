"use server";

import { db } from "@/db/client";
import { tournament } from "@/db/schema/tournament";
import {
  CreateTournamentFormData,
  createTournamentFormDataSchema,
} from "./schema";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { group } from "@/db/schema/group";
import { participant } from "@/db/schema/participant";
import { and, eq, InferInsertModel } from "drizzle-orm";
import { GridGroup } from "./types";
import { ParticipantWithName } from "@/db/types/participant";

// TODO: authentication / authorization

export async function createTournament(formData: CreateTournamentFormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const data = createTournamentFormDataSchema.parse(formData);

  const newTournament: typeof tournament.$inferInsert = {
    name: "TODO: HSK Klubturnier",
    allClocksDigital: true,
    club: data.clubName,
    startDate: new Date(data.startDate),
    endDate: new Date(data.endDate),
    email: data.email,
    location: data.location,
    numberOfRounds: data.numberOfRounds,
    phone: data.phone,
    softwareUsed: data.softwareUsed,
    timeLimit: data.timeLimit,
    tieBreakMethod: data.tieBreakMethod,
    type: data.tournamentType,
    organizerProfileId: parseInt(data.organizerProfileId),
  };

  await db.insert(tournament).values(newTournament);

  revalidatePath("/admin/tournament");
}

// TODO: check if this can be optimized
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
          name: true,
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

    for (const p of participantsInGroup) {
      await db
        .update(participant)
        .set({
          groupId: insertedGroup[0].id,
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

export async function saveGroups(tournmanetId: number, groups: GridGroup[]) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  for (const insertGroup of groups) {
    await db
      .insert(group)
      .values({
        groupName: `Gruppe ${insertGroup.groupNumber}`,
        groupNumber: insertGroup.groupNumber,
        tournamentId: tournmanetId,
      })
      // this will probably be necessary if we allow setting specific dates for groups
      .onConflictDoUpdate({
        target: [group.tournamentId, group.groupNumber],
        set: {
          groupNumber: insertGroup.groupNumber,
        },
      });

    await db
      .insert(participant)
      .values(
        insertGroup.participants.map(
          (p) =>
            ({
              profileId: p.profileId,
              tournamentId: tournmanetId,
              groupId: insertGroup.id,
              fideId: p.fideId,
              fideRating: p.fideRating,
              dwzRating: p.dwzRating,
            }) as InferInsertModel<typeof participant>,
        ),
      )
      .onConflictDoUpdate({
        target: [participant.tournamentId, participant.profileId],
        set: { groupId: insertGroup.id },
      });
  }

  revalidatePath("/admin/tournament");
}
