import { Chess, Move } from "chess.js";

export function currentBoardState(moves: Move[], index: number): Chess {
  const chess = new Chess();
  for (let i = 0; i <= index && i < moves.length; i++) {
    chess.move(moves[i]);
  }
  return chess;
}

export function computeFenForIndex(moves: Move[], index: number): string {
  const currentState = currentBoardState(moves, index);
  return currentState.fen();
}

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
