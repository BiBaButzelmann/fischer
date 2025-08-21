"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useTransition,
} from "react";
import { Chess, Move } from "chess.js";
import { Chessboard } from "react-chessboard";
import MoveHistory from "./move-history";
import { savePGN } from "@/actions/pgn";
import { toast } from "sonner";

export type Props = {
  gameId: number;
  initialPGN: string;
  allowEdit?: boolean;
};

export default function PgnViewer({
  gameId,
  initialPGN,
  allowEdit = false,
}: Props) {
  const [moves, setMoves] = useState(() => movesFromPGN(initialPGN));
  const [currentIndex, setCurrentIndex] = useState(moves.length - 1);
  const [isPending, startTransition] = useTransition();

  useChessboardControls({
    onArrowLeft: () => setCurrentIndex((i) => Math.max(-1, i - 1)),
    onArrowRight: () =>
      setCurrentIndex((i) => Math.min(moves.length - 1, i + 1)),
  });

  const fen = useMemo(
    () => computeFenForIndex(moves, currentIndex),
    [moves, currentIndex],
  );

  const fullPGN = useMemo(() => computePGNFromMoves(moves), [moves]);

  const handleSave = useCallback(() => {
    startTransition(async () => {
      const result = await savePGN(fullPGN, gameId);

      if (result?.error) {
        toast.error("Nicht für Speichern autorisiert");
      } else {
        toast.success("Partie erfolgreich gespeichert");
      }
    });
  }, [fullPGN, gameId]);

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
    <div className="rounded-xl border bg-card shadow p-6 w-fit">
      <div className="flex flex-col lg:flex-row gap-6 w-full">
        <div className="flex-shrink-0 w-full max-w-lg mx-auto lg:mx-0">
          <div className="aspect-square w-full">
            <Chessboard
              position={fen}
              arePiecesDraggable={allowEdit}
              onPieceDrop={handleDrop}
            />
          </div>
        </div>

        <div className="w-80 flex-shrink-0">
          <MoveHistory
            history={moves}
            currentMoveIndex={currentIndex}
            goToMove={setCurrentIndex}
            onSave={allowEdit ? handleSave : undefined}
            isSaving={isPending}
            showSave={allowEdit}
          />
        </div>
      </div>
    </div>
  );
}

function movesFromPGN(pgn: string): Move[] {
  const game = new Chess();
  game.loadPgn(pgn);
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

function computePGNFromMoves(moves: Move[]): string {
  const chess = new Chess();
  for (const move of moves) {
    chess.move(move);
  }
  return chess.pgn();
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
