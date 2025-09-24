import { GameResult } from "@/db/types/game";

export function getIndividualPlayerResult(
  gameResult: GameResult,
  isWhite: boolean,
) {
  const [whiteScore, blackScore] = gameResult.split(/[:-]/);
  return isWhite ? whiteScore : blackScore;
}
