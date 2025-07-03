"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Chess, Move } from "chess.js";
import { Chessboard } from "react-chessboard";
import MoveHistory from "./move-history";
import SavePGNButton from "./save-pgn-button";

export interface Props {
  gameId: number;
  initialPGN: string;
  allowEdit?: boolean;
}

export default function PgnViewer({
  gameId,
  initialPGN,
  allowEdit = false,
}: Props) {
  const [moves, setMoves] = useState(() => movesFromPGN(initialPGN));
  const [currentIndex, setCurrentIndex] = useState(moves.length - 1);

  useChessboardControls({
    onArrowLeft: () => setCurrentIndex((i) => Math.max(-1, i - 1)),
    onArrowRight: () =>
      setCurrentIndex((i) => Math.min(moves.length - 1, i + 1)),
  });

  const fen = useMemo(
    () => computeFenForIndex(moves, currentIndex),
    [moves, currentIndex],
  );

  const fullPGN = useMemo(
    () => computeFenForIndex(moves, moves.length - 1),
    [moves],
  );

  const handleDrop = useCallback(
    (sourceSquare: string, targetSquare: string): boolean => {
      const boardState = currentBoardState(moves, currentIndex);

      const move = boardState.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });
      if (!move) return false;

      const updatedMoves = moves.slice(0, currentIndex + 1).concat(move);
      setMoves(updatedMoves);
      setCurrentIndex(updatedMoves.length - 1);
      return true;
    },
    [moves, currentIndex],
  );

  return (
    <div className="flex gap-4 items-start flex-nowrap">
      <Chessboard
        position={fen}
        arePiecesDraggable={allowEdit}
        onPieceDrop={handleDrop}
      />

      <div>
        <MoveHistory
          history={moves}
          currentMoveIndex={currentIndex}
          goToMove={setCurrentIndex}
        />

        {allowEdit ? (
          <div className="w-full md:ml-8 md:w-auto">
            <SavePGNButton newValue={fullPGN} gameId={gameId} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function movesFromPGN(pgn: string): Move[] {
  const game = new Chess();
  if (pgn.trim()) {
    game.loadPgn(pgn);
  }
  return game.history({ verbose: true });
}

function currentBoardState(moves: Move[], index: number): Chess {
  const chess = new Chess();
  for (let i = 0; i <= index; i++) {
    chess.move(moves[i]);
  }
  return chess;
}

function computeFenForIndex(moves: Move[], index: number): string {
  const currentState = currentBoardState(moves, index);
  return currentState.fen();
}

const useChessboardControls = ({
  onArrowLeft,
  onArrowRight,
}: {
  onArrowLeft: () => void;
  onArrowRight: () => void;
}) => {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        onArrowLeft();
      } else if (e.key === "ArrowRight") {
        onArrowRight();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onArrowLeft, onArrowRight]);
};
