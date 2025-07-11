import { db } from "../client";
import { participant } from "../schema/participant";
import { profile } from "../schema/profile";
import { eq, getTableColumns } from "drizzle-orm";

export async function getParticipantByProfileIdAndTournamentId(
  profileId: number,
  tournamentId: number,
) {
  return await db.query.participant.findFirst({
    where: (participant, { eq, and }) =>
      and(
        eq(participant.profileId, profileId),
        eq(participant.tournamentId, tournamentId),
      ),
  });
}

export async function getParticipantByUserId(userId: string) {
  const rows = await db
    .select(getTableColumns(participant))
    .from(participant)
    .leftJoin(profile, eq(participant.profileId, profile.id))
    .where(eq(profile.userId, userId));
  return rows.length > 0 ? rows[0] : undefined;
}

export async function getUnassignedParticipantsByTournamentId(
  tournamentId: number,
) {
  return await db.query.participant.findMany({
    where: (participant, { eq, and, isNull }) =>
      and(
        eq(participant.tournamentId, tournamentId),
        isNull(participant.groupId),
      ),
    with: {
      profile: {
        columns: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });
}

export async function getParticipantsByTournamentId(tournamentId: number) {
  return await db.query.participant.findMany({
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
      sql`${participant.dwzRating} IS NULL`,
      desc(participant.dwzRating),
    ],
  });
}

export async function getParticipantsByGroupId(groupId: number) {
  return await db.query.participant.findMany({
    where: (participant, { eq }) => eq(participant.groupId, groupId),
    columns: {
      id: true,
      title: true,
    },
    with: {
      profile: {
        columns: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });
}
