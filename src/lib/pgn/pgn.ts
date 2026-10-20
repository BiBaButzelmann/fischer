import { Chess, Move } from "chess.js";
import type { PgnHeaders } from "./headers";

export function toPgn(moves: Pick<Move, "san">[], headers: PgnHeaders): string {
  const chess = new Chess();
  for (const [key, value] of Object.entries(headers)) {
    if (value) {
      chess.setHeader(key, escapeTagValue(value));
    }
  }
  for (const move of moves) {
    chess.move(move.san);
  }
  return chess.pgn();
}

function escapeTagValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
