import {
  isUserParticipantInGame,
  isUserMatchEnteringHelperInGame,
  isUserRefereeInGame,
} from "@/db/repositories/game";
import { GameResult, GameWithParticipants } from "@/db/types/game";
import { getRolesByUserId } from "@/db/repositories/role";

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
    game.whiteParticipant?.id === participantId ||
    game.blackParticipant?.id === participantId
  );
};

export const isWhite = (
  game: GameWithParticipants,
  participantId: number,
): boolean => {
  return game.whiteParticipant?.id === participantId;
};

export const canUserViewGame = async (
  gameId: number,
  userId: string,
  isAdmin: boolean,
) => {
  const [userRoles, isMatchEnteringHelper, isReferee] = await Promise.all([
    getRolesByUserId(userId),
    isUserMatchEnteringHelperInGame(gameId, userId),
    isUserRefereeInGame(gameId, userId),
  ]);

  const isParticipant = userRoles.includes("participant");

  return isParticipant || isReferee || isMatchEnteringHelper || isAdmin;
};

export const canUserEditGame = async (
  gameId: number,
  userId: string,
  isAdmin: boolean,
) => {
  const [isGameParticipant, isMatchEnteringHelper] = await Promise.all([
    isUserParticipantInGame(gameId, userId),
    isUserMatchEnteringHelperInGame(gameId, userId),
  ]);

  return isGameParticipant || isMatchEnteringHelper || isAdmin;
};
