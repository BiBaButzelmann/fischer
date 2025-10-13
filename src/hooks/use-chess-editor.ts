import { useCallback, useState } from "react";
import { useChessNavigation } from "./use-chess-navigation";
import { useChess } from "@/contexts/chess-context";

export function useChessEditor(gameId: number) {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const { currentIndex, setCurrentIndex, fen, getAllMoves, makeMove, getPiece } = useChess();
  const moves = getAllMoves();
  
  useChessNavigation();

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
      const piece = getPiece(square);

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
    [selectedSquare, makeMove, getPiece],
  );

  return {
    fen,
    onPieceDrop: handleDrop,
    onSquareClick: handleSquareClick,
    selectedSquare,
    moves,
    currentIndex,
    setCurrentIndex,
    gameId,
  };
}