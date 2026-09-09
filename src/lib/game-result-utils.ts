import {
  GameResult,
  PlayedGameResult,
  PLAYED_GAME_RESULTS,
} from "@/db/types/game";

export const isGameActuallyPlayed = (
  result: GameResult | null,
): result is PlayedGameResult => {
  if (!result) return false;
  return PLAYED_GAME_RESULTS.includes(result as PlayedGameResult);
};

export function getIndividualPlayerResult(
  gameResult: GameResult,
  isWhite: boolean,
): string {
  // TODO: change 1/2-1/2 to 1/2:1/2
  switch (gameResult) {
    case "1:0":
      return isWhite ? "1" : "0";
    case "0:1":
      return isWhite ? "0" : "1";
    case "½-½":
      return "½";
    case "+:-":
      return isWhite ? "+" : "−";
    case "-:+":
      return isWhite ? "−" : "+";
    case "-:-":
      return "−";
    case "0-½":
      return isWhite ? "0" : "½";
    case "½-0":
      return isWhite ? "½" : "0";
    default:
      return "";
  }
}
