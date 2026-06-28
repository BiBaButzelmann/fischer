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
      if (group.tier < 1) {
        continue;
      }

      const [participants, standings] = await Promise.all([
        getParticipantsInGroup(group.id),
        getStandings(group.id),
      ]);

      const winnerParticipantId = standings[0]?.participantId;
      if (winnerParticipantId == null) {
        continue;
      }

      const winner = participants.find((p) => p.id === winnerParticipantId);
      if (!winner) {
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
