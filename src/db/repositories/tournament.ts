import { db } from "../client";

export async function getActiveTournament() {
  return await db.query.tournament.findFirst({
    where: (tournament, { or, eq }) =>
      or(eq(tournament.stage, "registration"), eq(tournament.stage, "running")),
    orderBy: (tournament, { desc }) => [desc(tournament.startDate)],
  });
}

export async function getActiveTournamentWithGroups() {
  return await db.query.tournament.findFirst({
    where: (tournament, { or, eq }) =>
      or(eq(tournament.stage, "registration"), eq(tournament.stage, "running")),
    with: {
      groups: true,
    },
  });
}

export async function getLatestTournament() {
  return await db.query.tournament.findFirst({
    orderBy: (tournament, { desc }) => [desc(tournament.createdAt)],
  });
}
