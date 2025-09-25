import { GameResult } from "@/db/types/game";

export function getIndividualPlayerResult(
  gameResult: GameResult,
  isWhite: boolean,
) {
  // TODO: change 1/2-1/2 to 1/2:1/2
  const [whiteScore, blackScore] = gameResult.split(/[:-]/);
  return isWhite ? whiteScore : blackScore;
}
