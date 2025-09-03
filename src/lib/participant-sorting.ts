import { getTournamentWeeksByTournamentId } from "@/db/repositories/tournamentWeek";
import { NUMBER_OF_GROUPS_WITH_ELO } from "@/constants/constants";
import { ParticipantWithName } from "@/db/types/participant";

/**
 * Calculates the number of participants in ELO groups based on tournament ID and regular weeks
 * Formula: NUMBER_OF_GROUPS_WITH_ELO * (number of regular tournament weeks + 1)
 */
export async function getEloGroupsParticipantCount(tournamentId: number) {
  const tournamentWeeks = await getTournamentWeeksByTournamentId(tournamentId);
  const regularWeeksCount = tournamentWeeks.filter(
    (week) => week.status === "regular",
  ).length;

  return NUMBER_OF_GROUPS_WITH_ELO * (regularWeeksCount + 1);
}

/**
 * Sorts participants for the tournament overview:
 * - First X participants are sorted by ELO rating (highest first)
 * - Remaining participants are sorted by DWZ rating (highest first)
 * - Returns the sorted participants and the split index
 */
export async function sortParticipantsByEloAndDWZ(
  participants: ParticipantWithName[],
  tournamentId: number,
): Promise<{
  sortedParticipants: ParticipantWithName[];
  eloSortedCount: number;
}> {
  const eloSortedCount = await getEloGroupsParticipantCount(tournamentId);

  const sortedByElo = [...participants].sort((a, b) => {
    if (a.fideRating === null && b.fideRating === null) return 0;
    if (a.fideRating === null) return 1;
    if (b.fideRating === null) return -1;
    return b.fideRating - a.fideRating;
  });
  const eloGroup = sortedByElo.slice(0, eloSortedCount);

  const participantIdsInEloGroup = new Set(eloGroup.map((p) => p.id));
  const remainingParticipants = participants.filter(
    (p) => !participantIdsInEloGroup.has(p.id),
  );
  const dwzGroup = remainingParticipants.sort((a, b) => {
    if (a.dwzRating === null && b.dwzRating === null) return 0;
    if (a.dwzRating === null) return 1;
    if (b.dwzRating === null) return -1;
    return b.dwzRating - a.dwzRating;
  });

  return {
    sortedParticipants: [...eloGroup, ...dwzGroup],
    eloSortedCount: eloGroup.length,
  };
}
