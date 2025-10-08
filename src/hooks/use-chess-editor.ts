import { Square } from "chess.js";
import { useCallback, useEffect, useState } from "react";
import { movesFromPGN } from "@/components/game/chessboard/pgn-actions";
import { currentBoardState } from "@/lib/chess-utils";
import { useChessNavigation } from "./use-chess-navigation";

export function useChessEditor(initialPGN: string, gameId: number) {
  const [moves, setMoves] = useState(() => movesFromPGN(initialPGN));
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);

  useEffect(() => {
    const newMoves = movesFromPGN(initialPGN);
    setMoves(newMoves);
  }, [initialPGN]);

  const { currentIndex, setCurrentIndex, fen, pgn } =
    useChessNavigation(moves);

  const makeMove = useCallback(
    (from: string, to: string, promotion?: string): boolean => {
      const boardState = currentBoardState(moves, currentIndex);

      try {
        const moveOptions: { from: string; to: string; promotion?: string } = {
          from,
          to,
        };
        if (promotion) {
          moveOptions.promotion = promotion;
        }

        const move = boardState.move(moveOptions);
        const updatedMoves = moves.slice(0, currentIndex + 1).concat(move);
        setMoves(updatedMoves);
        setCurrentIndex(updatedMoves.length - 1);
        return true;
      } catch {
        return false;
      }
    },
    [moves, currentIndex, setMoves, setCurrentIndex],
  );

  const handleDrop = useCallback(
    (sourceSquare: string, targetSquare: string, piece?: string): boolean => {
      let promotion: string | undefined;
      if (piece && piece.length === 2) {
        const promotionPiece = piece[1].toLowerCase();
        if (["q", "r", "b", "n"].includes(promotionPiece)) {
          promotion = promotionPiece;
        }
      }

      return makeMove(sourceSquare, targetSquare, promotion);
    },
    [makeMove],
  );

  const handleSquareClick = useCallback(
    (square: string) => {
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
    [moves, currentIndex, selectedSquare, makeMove],
  );

  return {
    fen,
    onPieceDrop: handleDrop,
    onSquareClick: handleSquareClick,
    selectedSquare,
    moves,
    currentIndex,
    setCurrentIndex,
    setMoves,
    pgn,
    gameId,
  };
}