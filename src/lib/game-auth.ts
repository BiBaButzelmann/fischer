import {
  isUserParticipantInGame,
  isUserMatchEnteringHelperInGame,
  isUserRefereeInGame,
} from "@/db/repositories/game";
import {
  GameResult,
  GameWithParticipants,
  PlayedGameResult,
  PLAYED_GAME_RESULTS,
} from "@/db/types/game";
import { getRolesByUserId } from "@/db/repositories/role";

export const isGameActuallyPlayed = (
  result: GameResult | null,
): result is PlayedGameResult => {
  if (!result) return false;
  return PLAYED_GAME_RESULTS.includes(result as PlayedGameResult);
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

export const getUserGameRights = async (gameId: number, userId: string) => {
  const [userRoles, isGameParticipant, isMatchEnteringHelper, isReferee] =
    await Promise.all([
      getRolesByUserId(userId),
      isUserParticipantInGame(gameId, userId),
      isUserMatchEnteringHelperInGame(gameId, userId),
      isUserRefereeInGame(gameId, userId),
    ]);

  const isParticipant = userRoles.includes("participant");
  const isAdmin = userRoles.includes("admin");

  if (isGameParticipant || isMatchEnteringHelper || isAdmin || isReferee) {
    return "edit";
  }

  if (isParticipant) {
    return "view";
  }

  return null;
};
