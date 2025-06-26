// components/ChessGameContainer.tsx
"use client";

/* -------------------------------------------------------------------------
 * Interactive chessboard + move list that **persists** the full history even
 * when the user jumps backward. New moves taken from an earlier position will
 * truncate the "future" branch (like typical chess GUIs) rather than wiping
 * everything. The PGN list in the sidebar therefore never mysteriously
 * disappears while the user is browsing.
 * ----------------------------------------------------------------------- */

import { useState, useEffect, useCallback } from "react";
import { Chess, Move } from "chess.js";
import { Chessboard } from "react-chessboard";

import MoveHistory from "@/components/chessboard/move-history";
import SavePGNButton from "@/components/chessboard/save-pgn-button";

export interface ChessGameContainerProps {
  initialPGN?: string;
  gameId: number;
}

function movesFromPGN(pgn?: string): Move[] {
  const game = new Chess();
  if (pgn?.trim()) {
    game.loadPgn(pgn);
  }
  return game.history({ verbose: true });
}

export default function ChessGameContainer({
  initialPGN,
  gameId,
}: ChessGameContainerProps) {
  const [moves, setMoves] = useState<Move[]>(() => movesFromPGN(initialPGN));
  /** Index of the half‑move currently being shown (‑1 = before any move). */
  const [currentIndex, setCurrentIndex] = useState<number>(moves.length - 1);

  // ---------------------------------------------------------------------
  // Utilities
  // ---------------------------------------------------------------------
  const computeFenForIndex = useCallback(
    (index: number) => {
      const chess = new Chess();
      for (let i = 0; i <= index; i++) chess.move(moves[i]);
      return chess.fen();
    },
    [moves],
  );

  const [fen, setFen] = useState(() => computeFenForIndex(currentIndex));

  useEffect(() => {
    setFen(computeFenForIndex(currentIndex));
  }, [currentIndex, moves, computeFenForIndex]);

  // ---------------------------------------------------------------------
  // Drag‑and‑drop move handling
  // ---------------------------------------------------------------------
  const handleDrop = useCallback(
    (sourceSquare: string, targetSquare: string): boolean => {
      const chess = new Chess();
      // Play all moves up to the current index to reach that position
      for (let i = 0; i <= currentIndex; i++) chess.move(moves[i]);

      const move = chess.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });
      if (!move) return false; // illegal move

      // If we were not at the end, truncate the future branch first
      const updatedMoves = moves.slice(0, currentIndex + 1).concat(move);
      setMoves(updatedMoves);
      setCurrentIndex(updatedMoves.length - 1);
      // chess now has the new position
      setFen(chess.fen());
      return true;
    },
    [moves, currentIndex],
  );

  // ---------------------------------------------------------------------
  // Keyboard navigation
  // ---------------------------------------------------------------------
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        setCurrentIndex((i) => Math.max(-1, i - 1));
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((i) => Math.min(moves.length - 1, i + 1));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moves.length]);

  // ---------------------------------------------------------------------
  // PGN string derived from **all** moves (not truncated by navigation)
  // ---------------------------------------------------------------------
  const fullPGN = (() => {
    const g = new Chess();
    moves.forEach((m) => g.move(m));
    return g.pgn();
  })();

  return (
    <div className="flex gap-4 items-start flex-nowrap">
      <Chessboard position={fen} arePiecesDraggable onPieceDrop={handleDrop} />

      <div>
        <MoveHistory
          history={moves}
          currentMoveIndex={currentIndex}
          goToMove={setCurrentIndex}
        />

        <div className="w-full md:ml-8 md:w-auto">
          <SavePGNButton newValue={fullPGN} gameId={gameId} />
        </div>
      </div>
    </div>
  );
}
