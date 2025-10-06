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

function parseUciMove(uciMove: string): {
  from: string;
  to: string;
  promotion?: string;
} | null {
  if (uciMove.length < 4) return null;

  return {
    from: uciMove.substring(0, 2),
    to: uciMove.substring(2, 4),
    promotion: uciMove.length > 4 ? uciMove.substring(4, 5) : undefined,
  };
}

function calculateMoveNumber(
  moveIndex: number,
  startingMoveNumber: number,
  isBlackToMove: boolean,
): number {
  return (
    startingMoveNumber +
    Math.floor((isBlackToMove ? moveIndex - 1 : moveIndex) / 2)
  );
}

function formatMoveWithNumber(
  germanSan: string,
  moveIndex: number,
  startingMoveNumber: number,
  isBlackToMove: boolean,
): string {
  const isWhiteMove = isBlackToMove
    ? moveIndex % 2 === 1
    : moveIndex % 2 === 0;

  // First move by black (continuing from mid-game)
  if (moveIndex === 0 && isBlackToMove) {
    return `${startingMoveNumber}...${germanSan}`;
  }
  
  // White move gets a move number
  if (isWhiteMove) {
    const moveNumber = calculateMoveNumber(
      moveIndex,
      startingMoveNumber,
      isBlackToMove,
    );
    return `${moveNumber}.${germanSan}`;
  }
  
  // Black move without number
  return germanSan;
}

/**
 * Converts UCI moves to German chess notation
 * 
 * UCI format: "e2e4" (from e2 to e4), promotions: "e7e8q"
 * German notation: K=King, D=Queen, T=Rook, L=Bishop, S=Knight
 * Move numbering: "1.e4 e5 2.Sf3" or "5...Sf6" for mid-game start
 */
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
      const parsedMove = parseUciMove(uciMove);
      if (!parsedMove) break;

      try {
        // using chess.js to find out the piece that is on the from-square
        const move = chess.move({
          from: parsedMove.from,
          to: parsedMove.to,
          promotion: parsedMove.promotion,
        });
        if (!move) break;

        const germanSan = toGermanNotation(move.san);
        const moveIndex = formatted.length;

        const formattedMove = formatMoveWithNumber(
          germanSan,
          moveIndex,
          startingMoveNumber,
          isBlackToMove,
        );

        formatted.push(formattedMove);
      } catch {
        break;
      }
    }

    return formatted.join(" ");
  } catch {
    return "";
  }
}
