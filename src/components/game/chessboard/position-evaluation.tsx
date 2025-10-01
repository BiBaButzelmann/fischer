"use client";

import { useEffect } from "react";
import { useStockfish } from "@/hooks/use-stockfish";

type Props = {
  fen: string;
  className?: string;
  showDetails?: boolean;
};

export function PositionEvaluation({
  fen,
  className = "",
  showDetails = true,
}: Props) {
  const {
    isReady,
    evaluation,
    analyzePosition,
    formatEvaluation,
    wasmSupported,
    isEnabled,
    toggleEngine,
  } = useStockfish();

  useEffect(() => {
    if (isReady && fen) {
      analyzePosition(fen);
    }
  }, [fen, isReady, analyzePosition]);

  if (!wasmSupported) {
    return null;
  }

  const evalText = evaluation ? formatEvaluation(evaluation) : "";
  const isPositive = evaluation?.cp
    ? evaluation.cp > 0
    : evaluation?.mate
      ? evaluation.mate > 0
      : false;
  const isMate = evaluation?.mate !== undefined;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <button
          onClick={toggleEngine}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            isEnabled ? "bg-green-500" : "bg-red-500"
          }`}
          title={isEnabled ? "Engine ausschalten" : "Engine einschalten"}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
              isEnabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
        {isEnabled && evaluation && (
          <div
            className={`text-sm font-mono px-3 py-1.5 rounded-md text-center min-w-[70px] font-semibold ${
              isMate
                ? isPositive
                  ? "bg-green-100 text-green-900"
                  : "bg-red-100 text-red-900"
                : isPositive
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
            }`}
          >
            {evalText}
          </div>
        )}
      </div>

      {isEnabled && showDetails && evaluation && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span className="font-mono font-medium">
              {evaluation.depth}
              {evaluation.seldepth && ` / ${evaluation.seldepth}`}
            </span>
          </div>

          {evaluation.bestMove && (
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Bester Zug:</span>
              <span className="font-mono font-medium text-blue-700">
                {evaluation.bestMove}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
