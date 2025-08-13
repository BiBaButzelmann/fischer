import {
  isUserParticipantInGame,
  isUserMatchEnteringHelperInGame,
} from "@/db/repositories/game";
import { GameResult } from "@/db/types/game";

export const isGameActuallyPlayed = (result: GameResult | null): boolean => {
  if (!result) return false;

  const playedResults: GameResult[] = ["1:0", "0:1", "½-½", "0-½", "½-0"];
  return playedResults.includes(result);
};

export const isUserAuthorizedForPGN = async (
  gameId: number,
  userId: string,
  isAdmin: boolean,
) => {
  const [isParticipant, isMatchEnteringHelper] = await Promise.all([
    isUserParticipantInGame(gameId, userId),
    isUserMatchEnteringHelperInGame(gameId, userId),
  ]);

  return isParticipant || isMatchEnteringHelper || isAdmin;
};
