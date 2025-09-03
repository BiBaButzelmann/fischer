import { db } from "../client";
import { group } from "../schema/group";
import { participant, participantGroup } from "../schema/participant";
import { profile } from "../schema/profile";
import { and, eq, getTableColumns, isNull, desc, sql } from "drizzle-orm";

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

export async function getParticipantWithGroupByProfileIdAndTournamentId(
  profileId: number,
  tournamentId: number,
) {
  return await db.query.participant.findFirst({
    where: (participant, { eq, and }) =>
      and(
        eq(participant.profileId, profileId),
        eq(participant.tournamentId, tournamentId),
      ),
    with: {
      group: {
        with: {
          group: {
            columns: {
              id: true,
              groupName: true,
              dayOfWeek: true,
            },
          },
        },
      },
    },
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
  return await db
    .select({
      ...getTableColumns(participant),
      profile: {
        firstName: profile.firstName,
        lastName: profile.lastName,
      },
    })
    .from(participant)
    .leftJoin(
      participantGroup,
      eq(participant.id, participantGroup.participantId),
    )
    .innerJoin(profile, eq(participant.profileId, profile.id))
    .where(
      and(
        eq(participant.tournamentId, tournamentId),
        isNull(participantGroup.participantId),
      ),
    )
    .orderBy(
      sql`${participant.fideRating} IS NULL`,
      desc(participant.fideRating),
      sql`${participant.dwzRating} IS NULL`,
      desc(participant.dwzRating),
    );
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
  return await db
    .select({
      ...getTableColumns(participant),
      profile: {
        firstName: profile.firstName,
        lastName: profile.lastName,
      },
    })
    .from(participantGroup)
    .innerJoin(group, eq(participantGroup.groupId, group.id))
    .innerJoin(participant, eq(participantGroup.participantId, participant.id))
    .innerJoin(profile, eq(participant.profileId, profile.id))
    .where(and(eq(group.id, groupId), isNull(participant.deletedAt)));
}

export async function getParticipantsWithProfileByGroupId(groupId: number) {
  return await db
    .select({
      ...getTableColumns(participant),
      profile: {
        userId: profile.userId,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phoneNumber: profile.phoneNumber,
      },
    })
    .from(participantGroup)
    .innerJoin(group, eq(participantGroup.groupId, group.id))
    .innerJoin(participant, eq(participantGroup.participantId, participant.id))
    .innerJoin(profile, eq(participant.profileId, profile.id))
    .where(eq(group.id, groupId))
    .orderBy(profile.lastName, profile.firstName);
}

export async function getParticipantsWithZpsPlayerIdByTournamentId(
  tournamentId: number,
) {
  return await db.query.participant.findMany({
    where: (participant, { eq, and, isNotNull }) =>
      and(
        eq(participant.tournamentId, tournamentId),
        isNotNull(participant.zpsPlayerId),
      ),
    columns: {
      id: true,
      zpsPlayerId: true,
    },
  });
}
