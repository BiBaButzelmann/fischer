import { Chess } from "chess.js";

export function toGermanNotation(san: string): string {
  return san
    .replace(/^N/, "S")
    .replace(/^B/, "L")
    .replace(/^R/, "T")
    .replace(/^Q/, "D")
    .replace(/^K/, "K")
    .replace(/=N/, "=S")
    .replace(/=B/, "=L")
    .replace(/=R/, "=T")
    .replace(/=Q/, "=D");
}

export function formatUciMovesAsNotation(
  uciMoves: string[],
  fenPosition: string,
): string {
  try {
    const chess = new Chess(fenPosition);
    const isBlackToMove = chess.turn() === "b";
    const startingMoveNumber = chess.moveNumber();

    const formatted: string[] = [];

    for (const uciMove of uciMoves) {
      if (uciMove.length < 4) break;

      const from = uciMove.substring(0, 2);
      const to = uciMove.substring(2, 4);
      const promotion =
        uciMove.length > 4 ? uciMove.substring(4, 5) : undefined;

      try {
        const move = chess.move({ from, to, promotion });
        if (!move) break;

        const germanSan = toGermanNotation(move.san);
        const moveIndex = formatted.length;
        const isWhiteMove = isBlackToMove
          ? moveIndex % 2 === 1
          : moveIndex % 2 === 0;

        if (moveIndex === 0 && isBlackToMove) {
          formatted.push(`${startingMoveNumber}...${germanSan}`);
        } else if (isWhiteMove) {
          const actualMoveNum =
            startingMoveNumber +
            Math.floor((isBlackToMove ? moveIndex - 1 : moveIndex) / 2);
          formatted.push(`${actualMoveNum}.${germanSan}`);
        } else {
          formatted.push(germanSan);
        }
      } catch {
        break;
      }
    }

    return formatted.join(" ");
  } catch {
    return "";
  }
}
