import { Chess, Move } from "chess.js";
import type { PgnHeaders } from "./headers";

/**
 * Parses a PGN (with or without headers) into its moves.
 * Throws if the PGN is not valid, e.g. on non-standard results like "½-½".
 */
export function parsePgnMoves(pgn: string): Move[] {
  const chess = new Chess();
  chess.loadPgn(pgn);
  return chess.history({ verbose: true });
}

export function toMovetext(moves: Pick<Move, "san">[]): string {
  return moves
    .map((move, index) =>
      index % 2 === 0 ? `${index / 2 + 1}. ${move.san}` : move.san,
    )
    .join(" ");
}

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
