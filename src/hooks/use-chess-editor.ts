import { useCallback, useState } from "react";
import { Square, Move } from "chess.js";
import { useChess } from "@/contexts/chess-context";

export function useChessEditor() {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const { currentIndex, setCurrentIndex, fen, makeMove, getPiece, moves } = useChess();

  const handleDrop = useCallback(
    (sourceSquare: string, targetSquare: string, piece?: string): boolean => {
      let promotion: string | undefined;
      if (piece && piece.length === 2) {
        const promotionPiece = piece[1].toLowerCase();
        if (["q", "r", "b", "n"].includes(promotionPiece)) {
          promotion = promotionPiece;
        }
      }

      return makeMove({
        from: sourceSquare as Square,
        to: targetSquare as Square,
        promotion: promotion as Move["promotion"],
      });
    },
    [makeMove],
  );

  const handleSquareClick = useCallback(
    (square: Square) => {
      const piece = getPiece(square);

      if (selectedSquare) {
        if (selectedSquare === square) {
          setSelectedSquare(null);
        } else {
          makeMove({
            from: selectedSquare as Square,
            to: square as Square,
          });
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
  };
}