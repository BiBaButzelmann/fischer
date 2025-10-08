import { Move } from "chess.js";
import { useEffect, useMemo, useState } from "react";
import { computeFenForIndex, computePGNFromMoves } from "@/lib/chess-utils";

export function useChessNavigation(moves: Move[]) {
  const [currentIndex, setCurrentIndex] = useState(moves.length - 1);

  useEffect(() => {
    setCurrentIndex(moves.length - 1);
  }, [moves]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentIndex((i) => Math.max(-1, i - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentIndex((i) => Math.min(moves.length - 1, i + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setCurrentIndex(-1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setCurrentIndex(moves.length - 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moves.length]);

  const fen = useMemo(
    () => computeFenForIndex(moves, currentIndex),
    [moves, currentIndex],
  );

  const pgn = useMemo(() => computePGNFromMoves(moves), [moves]);

  return { currentIndex, setCurrentIndex, fen, pgn };
}
