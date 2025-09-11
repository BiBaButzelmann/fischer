import { db } from "../client";

export async function getTournamentById(tournamentId: number) {
  return await db.query.tournament.findFirst({
    where: (tournament, { eq }) => eq(tournament.id, tournamentId),
  });
}

export async function getGameStartTimeByTournamentId(tournamentId: number) {
  return await db.query.tournament.findFirst({
    columns: {
      gameStartTime: true,
    },
    where: (tournament, { eq }) => eq(tournament.id, tournamentId),
  });
}

export async function getActiveTournament() {
  return await db.query.tournament.findFirst({
    where: (tournament, { or, eq }) =>
      or(eq(tournament.stage, "registration"), eq(tournament.stage, "running")),
    orderBy: (tournament, { desc }) => [desc(tournament.startDate)],
  });
}

export async function getLatestTournament() {
  return await db.query.tournament.findFirst({
    orderBy: (tournament, { desc }) => [desc(tournament.createdAt)],
  });
}

export async function getAllActiveTournamentNames() {
  return await db.query.tournament.findMany({
    columns: {
      id: true,
      name: true,
      numberOfRounds: true,
    },
    where: (tournament, { or, eq }) =>
      or(eq(tournament.stage, "running"), eq(tournament.stage, "done")),
    orderBy: (tournament, { desc }) => [desc(tournament.startDate)],
  });
}
