"use server";

import { db } from "../client";
import { and, eq, isNull, or, exists, sql } from "drizzle-orm";
import { profile } from "../schema/profile";
import { participant } from "../schema/participant";
import { referee } from "../schema/referee";
import { juror } from "../schema/juror";
import { matchEnteringHelper } from "../schema/matchEnteringHelper";
import { setupHelper } from "../schema/setupHelper";
import { DEFAULT_CLUB_LABEL } from "@/constants/constants";

export async function getAllProfiles() {
  return await db.query.profile.findMany({
    where: isNull(profile.deletedAt),
    columns: {
      id: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
      userId: true,
      deletedAt: true,
    },
    orderBy: (profile, { asc }) => [
      asc(profile.lastName),
      asc(profile.firstName),
    ],
  });
}

export async function getAllParticipantsByTournamentId(tournamentId: number) {
  return await db.query.participant.findMany({
    where: (participant, { eq, and }) =>
      and(
        eq(participant.tournamentId, tournamentId),
        isNull(participant.deletedAt),
      ),
    columns: {
      id: true,
      dwzRating: true,
      fideRating: true,
      zpsPlayerId: true,
    },
    with: {
      profile: {
        columns: {
          id: true,
          userId: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          deletedAt: true,
        },
      },
    },
    orderBy: (participant, { asc }) => [asc(participant.id)],
  });
}

export async function getAllRefereesByTournamentId(tournamentId: number) {
  return await db.query.referee.findMany({
    where: (referee, { eq, and }) =>
      and(eq(referee.tournamentId, tournamentId), isNull(referee.deletedAt)),
    with: {
      profile: {
        columns: {
          id: true,
          userId: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          deletedAt: true,
        },
      },
    },
    orderBy: (referee, { asc }) => [asc(referee.id)],
  });
}

export async function getAllJurorsByTournamentId(tournamentId: number) {
  return await db.query.juror.findMany({
    where: (juror, { eq, and }) =>
      and(eq(juror.tournamentId, tournamentId), isNull(juror.deletedAt)),
    with: {
      profile: {
        columns: {
          id: true,
          userId: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          deletedAt: true,
        },
      },
    },
    orderBy: (juror, { asc }) => [asc(juror.id)],
  });
}

export async function getAllMatchEnteringHelpersByTournamentId(
  tournamentId: number,
) {
  return await db.query.matchEnteringHelper.findMany({
    where: (matchEnteringHelper, { eq, and }) =>
      and(
        eq(matchEnteringHelper.tournamentId, tournamentId),
        isNull(matchEnteringHelper.deletedAt),
      ),
    with: {
      profile: {
        columns: {
          id: true,
          userId: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          deletedAt: true,
        },
      },
    },
    orderBy: (matchEnteringHelper, { asc }) => [asc(matchEnteringHelper.id)],
  });
}

export async function getAllSetupHelpersByTournamentId(tournamentId: number) {
  return await db.query.setupHelper.findMany({
    where: (setupHelper, { eq, and }) =>
      and(
        eq(setupHelper.tournamentId, tournamentId),
        isNull(setupHelper.deletedAt),
      ),
    with: {
      profile: {
        columns: {
          id: true,
          userId: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          deletedAt: true,
        },
      },
    },
    orderBy: (setupHelper, { asc }) => [asc(setupHelper.id)],
  });
}

export async function getAllDisabledProfiles() {
  return await db.query.profile.findMany({
    where: (profile, { isNotNull }) => isNotNull(profile.deletedAt),
    columns: {
      id: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
      userId: true,
      deletedAt: true,
    },
    orderBy: (profile, { desc, asc }) => [
      desc(profile.deletedAt),
      asc(profile.lastName),
      asc(profile.firstName),
    ],
  });
}

export async function getAllProfilesWithRolesByTournamentId(
  tournamentId: number,
) {
  return await db
    .select({
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phoneNumber: profile.phoneNumber,
    })
    .from(profile)
    .where(
      and(
        isNull(profile.deletedAt),
        or(
          exists(
            db
              .select()
              .from(participant)
              .where(
                and(
                  sql`${participant.profileId} = ${profile.id}`,
                  eq(participant.tournamentId, tournamentId),
                  isNull(participant.deletedAt),
                ),
              ),
          ),
          exists(
            db
              .select()
              .from(referee)
              .where(
                and(
                  sql`${referee.profileId} = ${profile.id}`,
                  eq(referee.tournamentId, tournamentId),
                  isNull(referee.deletedAt),
                ),
              ),
          ),
          exists(
            db
              .select()
              .from(juror)
              .where(
                and(
                  sql`${juror.profileId} = ${profile.id}`,
                  eq(juror.tournamentId, tournamentId),
                  isNull(juror.deletedAt),
                ),
              ),
          ),
          exists(
            db
              .select()
              .from(matchEnteringHelper)
              .where(
                and(
                  sql`${matchEnteringHelper.profileId} = ${profile.id}`,
                  eq(matchEnteringHelper.tournamentId, tournamentId),
                  isNull(matchEnteringHelper.deletedAt),
                ),
              ),
          ),
          exists(
            db
              .select()
              .from(setupHelper)
              .where(
                and(
                  sql`${setupHelper.profileId} = ${profile.id}`,
                  eq(setupHelper.tournamentId, tournamentId),
                  isNull(setupHelper.deletedAt),
                ),
              ),
          ),
        ),
      ),
    );
}

export async function getNonDefaultClubParticipantsByTournamentId(
  tournamentId: number,
) {
  return await db.query.participant.findMany({
    where: (participant, { eq, and, ne }) =>
      and(
        eq(participant.tournamentId, tournamentId),
        ne(participant.chessClub, DEFAULT_CLUB_LABEL),
        isNull(participant.deletedAt),
      ),
    columns: {
      id: true,
      chessClub: true,
      dwzRating: true,
      fideRating: true,
      entryFeePayed: true,
    },
    with: {
      profile: {
        columns: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: (participant, { asc }) => [asc(participant.id)],
  });
}

export async function getNonDefaultClubParticipantsWithEmailByTournamentId(
  tournamentId: number,
) {
  return await db.query.participant.findMany({
    where: (participant, { eq, and, ne }) =>
      and(
        eq(participant.tournamentId, tournamentId),
        ne(participant.chessClub, DEFAULT_CLUB_LABEL),
        isNull(participant.deletedAt),
      ),
    columns: {
      id: true,
      entryFeePayed: true,
    },
    with: {
      profile: {
        columns: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: (participant, { asc }) => [asc(participant.id)],
  });
}
