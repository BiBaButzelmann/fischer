import { useEffect } from "react";
import { useChess } from "@/contexts/chess-context";

export function useChessNavigation() {
  const { forward, back, goToStart, goToEnd } = useChess();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        back();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        forward();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        goToStart();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        goToEnd();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [forward, back, goToStart, goToEnd]);
}
