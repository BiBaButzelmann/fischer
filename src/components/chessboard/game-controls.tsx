"use client";

import { useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, SkipBack, SkipForward } from "lucide-react";

interface GameControlsProps {
  moves: string[];
  currentMoveIndex: number;
  onMoveIndexChange: (index: number) => void;
}

export function GameControls({
  moves,
  currentMoveIndex,
  onMoveIndexChange,
}: GameControlsProps) {
  const goToStart = useCallback(() => {
    onMoveIndexChange(-1);
  }, [onMoveIndexChange]);

  const goToPreviousMove = useCallback(() => {
    if (currentMoveIndex > -1) {
      onMoveIndexChange(currentMoveIndex - 1);
    }
  }, [currentMoveIndex, onMoveIndexChange]);

  const goToNextMove = useCallback(() => {
    if (currentMoveIndex < moves.length - 1) {
      onMoveIndexChange(currentMoveIndex + 1);
    }
  }, [currentMoveIndex, moves.length, onMoveIndexChange]);

  const goToEnd = useCallback(() => {
    if (moves.length > 0) {
      onMoveIndexChange(moves.length - 1);
    }
  }, [moves.length, onMoveIndexChange]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only handle arrow keys if no input is focused
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "SELECT"
      ) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToPreviousMove();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goToNextMove();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [goToPreviousMove, goToNextMove]);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={goToStart}
        disabled={currentMoveIndex <= -1}
        className="bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
      >
        <SkipBack className="w-4 h-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={goToPreviousMove}
        disabled={currentMoveIndex <= -1}
        className="bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <span className="text-sm text-gray-400 px-2 min-w-24 text-center">
        {moves.length > 0
          ? `${Math.max(0, currentMoveIndex + 1)} / ${moves.length}`
          : "0 / 0"}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={goToNextMove}
        disabled={currentMoveIndex >= moves.length - 1 || moves.length === 0}
        className="bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={goToEnd}
        disabled={currentMoveIndex >= moves.length - 1 || moves.length === 0}
        className="bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
      >
        <SkipForward className="w-4 h-4" />
      </Button>
    </div>
  );
}
