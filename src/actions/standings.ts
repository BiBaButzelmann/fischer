"use server";

import {
  getGamesForStandings,
  getParticipantsInGroup,
} from "@/db/repositories/game";
import { calculateStandings, type PlayerStanding } from "@/lib/standings";

export async function getStandingsAction(
  groupId: number,
  maxRound?: number,
): Promise<PlayerStanding[]> {
  const participants = await getParticipantsInGroup(groupId);

  const games = await getGamesForStandings(groupId, maxRound);

  const standings = calculateStandings(games, participants);

  return standings;
}
