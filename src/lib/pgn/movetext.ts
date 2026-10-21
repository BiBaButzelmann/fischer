import { Chess, Move } from "chess.js";

/**
 * Parses a PGN (with or without headers) into its moves.
 * Throws if the PGN is not valid, e.g. on non-standard results like "½-½".
 */
export function parsePgnMoves(pgn: string): Move[] {
  const chess = new Chess();
  chess.loadPgn(pgn);
  return chess.history({ verbose: true });
}
