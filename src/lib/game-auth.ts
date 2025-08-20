import {
  isUserParticipantInGame,
  isUserMatchEnteringHelperInGame,
} from "@/db/repositories/game";
import { GameResult, GameWithParticipants } from "@/db/types/game";

export const isGameActuallyPlayed = (result: GameResult | null): boolean => {
  if (!result) return false;

  const playedResults: GameResult[] = ["1:0", "0:1", "½-½", "0-½", "½-0"];
  return playedResults.includes(result);
};

export const isParticipantInGame = (
  game: GameWithParticipants,
  participantId: number,
): boolean => {
  return (
    (game.whiteParticipant?.id === participantId) ||
    (game.blackParticipant?.id === participantId)
  );
};

export const isWhite = (
  game: GameWithParticipants,
  participantId: number,
): boolean => {
  return game.whiteParticipant?.id === participantId;
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
