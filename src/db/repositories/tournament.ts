import { cache } from "react";
import { db } from "../client";

export const getTournamentById = cache(async (tournamentId: number) => {
  return await db.query.tournament.findFirst({
    where: (tournament, { eq }) => eq(tournament.id, tournamentId),
  });
});

export const getTournamentBySlug = cache(async (slug: string) => {
  return await db.query.tournament.findFirst({
    where: (tournament, { eq }) => eq(tournament.slug, slug),
  });
});

export async function getAllTournaments() {
  return await db.query.tournament.findMany({
    columns: {
      id: true,
      name: true,
      slug: true,
      stage: true,
    },
    orderBy: (tournament, { desc }) => [desc(tournament.startDate)],
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
