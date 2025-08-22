"use server";

import { db } from "../client";
import { isNull } from "drizzle-orm";
import { profile } from "../schema/profile";

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

export async function getContributorsWithEmailByTournamentId(
  tournamentId: number,
) {
  const [participants, referees, jurors, matchEnteringHelpers, setupHelpers] =
    await Promise.all([
      db.query.participant.findMany({
        where: (participant, { eq, and }) =>
          and(
            eq(participant.tournamentId, tournamentId),
            isNull(participant.deletedAt),
          ),
        with: {
          profile: {
            columns: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      db.query.referee.findMany({
        where: (referee, { eq, and }) =>
          and(
            eq(referee.tournamentId, tournamentId),
            isNull(referee.deletedAt),
          ),
        with: {
          profile: {
            columns: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      db.query.juror.findMany({
        where: (juror, { eq, and }) =>
          and(eq(juror.tournamentId, tournamentId), isNull(juror.deletedAt)),
        with: {
          profile: {
            columns: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      db.query.matchEnteringHelper.findMany({
        where: (matchEnteringHelper, { eq, and }) =>
          and(
            eq(matchEnteringHelper.tournamentId, tournamentId),
            isNull(matchEnteringHelper.deletedAt),
          ),
        with: {
          profile: {
            columns: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      db.query.setupHelper.findMany({
        where: (setupHelper, { eq, and }) =>
          and(
            eq(setupHelper.tournamentId, tournamentId),
            isNull(setupHelper.deletedAt),
          ),
        with: {
          profile: {
            columns: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
    ]);

  const allContributors = [
    ...participants.map((p) => ({
      ...p.profile,
      role: "participant" as const,
    })),
    ...referees.map((r) => ({ ...r.profile, role: "referee" as const })),
    ...jurors.map((j) => ({ ...j.profile, role: "juror" as const })),
    ...matchEnteringHelpers.map((m) => ({
      ...m.profile,
      role: "matchEnteringHelper" as const,
    })),
    ...setupHelpers.map((s) => ({
      ...s.profile,
      role: "setupHelper" as const,
    })),
  ];

  return allContributors.reduce(
    (acc, person) => {
      if (!acc.some((p) => p.email === person.email)) {
        acc.push(person);
      }
      return acc;
    },
    [] as typeof allContributors,
  );
}
