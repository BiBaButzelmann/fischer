"use server";

import {
  getGamesForStandings,
  getParticipantsInGroup,
} from "@/db/repositories/game";
import {
  calculateStandings,
  type PlayerStanding,
  type ParticipantInGroup,
} from "@/lib/standings";

export async function getStandingsAction(
  groupId: number,
  maxRound?: number,
): Promise<
  | {
      success: true;
      standings: PlayerStanding[];
    }
  | {
      success: false;
      error: string;
    }
> {
  try {
    // Get all participants in the group
    const participants = await getParticipantsInGroup(groupId);

    // Get games with results
    const games = await getGamesForStandings(groupId, maxRound);

    // Calculate standings (now includes participants even if they have no games)
    const standings = calculateStandings(games, participants);

    return { success: true, standings };
  } catch (error) {
    console.error("Error fetching standings:", error);
    return { success: false, error: "Failed to fetch standings" };
  }
}
