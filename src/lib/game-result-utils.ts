import { GameResult } from "@/db/types/game";

export function getIndividualPlayerResult(
  gameResult: GameResult,
  isWhite: boolean,
) {
  // TODO: change 1/2-1/2 to 1/2:1/2
  const [whiteScore, blackScore] = gameResult.split(/[:-]/);
  return isWhite ? whiteScore : blackScore;
}

/**
 * The symbol shown for a single player in a cross-table cell. Walkover/forfeit
 * games use the "+" (winner) / "−" (loser) convention like the Partien page;
 * regular games show the player's score (1, ½, 0). Unlike
 * {@link getIndividualPlayerResult}, this handles the "+:-" / "-:+" notations
 * correctly (their scores contain the separators).
 */
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
