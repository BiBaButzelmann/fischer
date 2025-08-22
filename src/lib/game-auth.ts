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

export const getUserGameRights = async (
  gameId: number,
  userId: string,
  isAdmin: boolean,
) => {
  const [userRoles, isGameParticipant, isMatchEnteringHelper, isReferee] =
    await Promise.all([
      getRolesByUserId(userId),
      isUserParticipantInGame(gameId, userId),
      isUserMatchEnteringHelperInGame(gameId, userId),
      isUserRefereeInGame(gameId, userId),
    ]);

  const isParticipant = userRoles.includes("participant");

  if (isGameParticipant || isMatchEnteringHelper || isAdmin) {
    return "edit";
  }

  if (isParticipant || isReferee) {
    return "view";
  }

  return null;
};
