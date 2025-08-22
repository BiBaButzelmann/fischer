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
import type { Square } from "react-chessboard/dist/chessboard/types";
import { savePGN } from "@/actions/pgn";
import { toast } from "sonner";
import { MoveHistory } from "./move-history";

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
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);

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

  const makeMove = useCallback(
    (from: string, to: string): boolean => {
      const boardState = currentBoardState(moves, currentIndex);

      try {
        const move = boardState.move({
          from,
          to,
        });
        if (!move) return false;

        const updatedMoves = moves.slice(0, currentIndex + 1).concat(move);
        setMoves(updatedMoves);
        setCurrentIndex(updatedMoves.length - 1);
        return true;
      } catch {
        return false;
      }
    },
    [moves, currentIndex],
  );

  const handleDrop = useCallback(
    (sourceSquare: string, targetSquare: string): boolean => {
      return makeMove(sourceSquare, targetSquare);
    },
    [makeMove],
  );

  const handleSquareClick = useCallback(
    (square: string) => {
      if (!allowEdit) return;

      const boardState = currentBoardState(moves, currentIndex);
      const piece = boardState.get(square as Square);

      if (selectedSquare) {
        if (selectedSquare === square) {
          setSelectedSquare(null);
        } else {
          makeMove(selectedSquare, square);
          setSelectedSquare(null);
        }
      } else {
        if (piece) {
          setSelectedSquare(square);
        }
      }
    },
    [allowEdit, moves, currentIndex, selectedSquare, makeMove],
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
              onSquareClick={handleSquareClick}
              animationDuration={0}
              customSquareStyles={{
                ...(selectedSquare && {
                  [selectedSquare]: {
                    boxShadow: "inset 0 0 1px 6px rgba(255,255,255,0.75)",
                  },
                }),
              }}
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
