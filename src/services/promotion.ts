import { cache } from "react";
import { getGroupsByTournamentId } from "@/db/repositories/group";
import { getParticipantsInGroup } from "@/db/repositories/game";
import { getMostRecentDoneTournament } from "@/db/repositories/tournament";
import { getStandings } from "@/services/standings";
import { tierLetter } from "@/lib/groups";

export type PromotionEligibility = {
  wonGroupName: string;
  wonGroupTier: number;
  targetTier: number;
  targetTierLetter: string;
  targetIsAGroup: boolean;
};

export const getPromotionTargetsForPreviousEdition = cache(
  async (): Promise<Map<number, PromotionEligibility>> => {
    const targets = new Map<number, PromotionEligibility>();

    const previousTournament = await getMostRecentDoneTournament();
    if (!previousTournament) {
      return targets;
    }

    const groups = await getGroupsByTournamentId(previousTournament.id);
    for (const group of groups) {
      if (group.tier == null || group.tier < 1) {
        continue;
      }

      const [participants, standings] = await Promise.all([
        getParticipantsInGroup(group.id),
        getStandings(group.id),
      ]);

      const winnerStats = standings[0];
      if (winnerStats == null || winnerStats.gamesPlayed === 0) {
        continue;
      }

      const winner = participants.find(
        (p) => p.id === winnerStats.participantId,
      );
      if (winner == null || winner.deletedAt != null) {
        continue;
      }

      const targetTier = group.tier - 1;
      targets.set(winner.profileId, {
        wonGroupName: group.groupName,
        wonGroupTier: group.tier,
        targetTier,
        targetTierLetter: tierLetter(targetTier),
        targetIsAGroup: targetTier === 0,
      });
    }

    return targets;
  },
);

export async function getPromotionEligibility(
  profileId: number,
): Promise<PromotionEligibility | null> {
  const targets = await getPromotionTargetsForPreviousEdition();
  return targets.get(profileId) ?? null;
}
