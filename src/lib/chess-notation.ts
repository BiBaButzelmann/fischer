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

export function convertUciToSan(
  uciMoves: string[],
  fenPosition: string,
): string[] {
  try {
    const chess = new Chess(fenPosition);
    const sanMoves: string[] = [];

    for (const uciMove of uciMoves) {
      if (uciMove.length < 4) break;

      const from = uciMove.substring(0, 2);
      const to = uciMove.substring(2, 4);
      const promotion =
        uciMove.length > 4 ? uciMove.substring(4, 5) : undefined;

      try {
        const move = chess.move({ from, to, promotion });
        if (move) {
          sanMoves.push(toGermanNotation(move.san));
        } else {
          break;
        }
      } catch {
        break;
      }
    }

    return sanMoves;
  } catch {
    return [];
  }
}

export function formatBestLineWithMoveNumbers(
  sanMoves: string[],
  fenPosition: string,
): string {
  try {
    const chess = new Chess(fenPosition);
    const isBlackToMove = chess.turn() === "b";
    const startingMoveNumber = chess.moveNumber();

    const formatted: string[] = [];

    sanMoves.forEach((move, index) => {
      const isWhiteMove = isBlackToMove ? index % 2 === 1 : index % 2 === 0;

      if (index === 0 && isBlackToMove) {
        formatted.push(`${startingMoveNumber}...${move}`);
      } else if (isWhiteMove) {
        const actualMoveNum =
          startingMoveNumber +
          Math.floor((isBlackToMove ? index - 1 : index) / 2);
        formatted.push(`${actualMoveNum}.${move}`);
      } else {
        formatted.push(move);
      }
    });

    return formatted.join(" ");
  } catch {
    return sanMoves.join(" ");
  }
}
