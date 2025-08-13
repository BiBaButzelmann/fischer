import {
  isUserParticipantInGame,
  isUserMatchEnteringHelperInGame,
} from "@/db/repositories/game";

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
