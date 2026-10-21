import { Chess, Move } from "chess.js";

const TAG_PAIR_SECTION = /^(?:\s*\[[^\n]*\]\s*(?:\n|$))+/;

/**
 * Parses a PGN (with or without headers) into its moves.
 * Tag pairs are ignored before parsing, as chess.js cannot read escaped quotes
 * in tag values. A FEN tag therefore has no effect.
 * Throws if the PGN is not valid, e.g. on non-standard results like "½-½".
 */
export function parsePgnMoves(pgn: string): Move[] {
  const chess = new Chess();
  chess.loadPgn(pgn.replace(TAG_PAIR_SECTION, ""));
  return chess.history({ verbose: true });
}

export function toMovetext(moves: Pick<Move, "san">[]): string {
  return moves
    .map((move, index) =>
      index % 2 === 0 ? `${index / 2 + 1}. ${move.san}` : move.san,
    )
    .join(" ");
}
