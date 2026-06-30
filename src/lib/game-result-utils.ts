import { GameResult } from "@/db/types/game";

export function getIndividualPlayerResult(
  gameResult: GameResult,
  isWhite: boolean,
) {
  // TODO: change 1/2-1/2 to 1/2:1/2
  const [whiteScore, blackScore] = gameResult.split(/[:-]/);
  return isWhite ? whiteScore : blackScore;
}

export function getIndividualResultSymbol(
  result: GameResult,
  isWhite: boolean,
): string {
  switch (result) {
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
