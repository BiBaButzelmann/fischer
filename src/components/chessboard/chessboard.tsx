"use client";

import { Chess } from "chess.js";
import dynamic from "next/dynamic";

/* --- lazy-load the DnD board so it never runs on the server --- */
const Board = dynamic(
  () => import("react-chessboard").then((m) => m.Chessboard),
  { ssr: false },
);

export interface ChessBoardProps {
  /** live Chess.js instance */
  game: Chess;
  /** called after every legal drag-drop */
  onMove: (from: string, to: string) => void;
  /** optional pixel width (defaults 480) */
  boardWidth?: number;
}

export function ChessBoard({
  game,
  onMove,
  boardWidth = 480,
}: ChessBoardProps) {
  // translate react-chessboard’s callback into your domain handler
  const handleDrop = (from: string, to: string): boolean => {
    onMove(from, to);
    return true; // tells react-chessboard the drop was accepted
  };

  return (
    <Board
      id="AnalysisBoard"
      boardWidth={boardWidth}
      position={game.fen()}
      onPieceDrop={handleDrop}
    />
  );
}
