import { db } from "../client";

export async function getTournamentWeeksByTournamentId(tournamentId: number) {
  const weeks = await db.query.tournamentWeek.findMany({
    where: (tournamentWeek, { eq }) =>
      eq(tournamentWeek.tournamentId, tournamentId),
    orderBy: (tournamentWeek, { asc }) => [asc(tournamentWeek.weekNumber)],
  });

  return weeks;
}
