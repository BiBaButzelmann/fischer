import { Chess, Move } from "chess.js";

export function computePGNFromMoves(
  moves: Move[],
  headers?: Record<string, string>,
): string {
  const chess = new Chess();

  if (headers) {
    for (const [key, value] of Object.entries(headers)) {
      if (value) {
        chess.setHeader(key, value);
      }
    }
  }

  for (const move of moves) {
    chess.move(move);
  }
  return chess.pgn();
}
