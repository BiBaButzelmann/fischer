"use client";

import { useEffect } from "react";
import { useStockfish } from "@/hooks/use-stockfish";
import {
  convertUciToSan,
  formatBestLineWithMoveNumbers,
} from "@/lib/chess-notation";

type Props = {
  fen: string;
};

export function EnginePanel({ fen }: Props) {
  const {
    isReady,
    isEnabled,
    toggleEngine,
    evaluation,
    analyzePosition,
    formatEvaluation,
  } = useStockfish();

  useEffect(() => {
    if (isReady && isEnabled && fen) {
      analyzePosition(fen);
    }
  }, [fen, isReady, isEnabled, analyzePosition]);
  return (
    <div className="flex flex-col space-y-1.5 p-4 pb-3 flex-shrink-0">
      <div className="font-semibold leading-none tracking-tight flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>Notation</span>
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
        </div>
        {evaluation && isEnabled && (
          <div
            className={`text-sm font-mono px-2 py-1 rounded-md text-center min-w-[60px] font-semibold ${
              evaluation.mate !== undefined
                ? evaluation.mate > 0
                  ? "bg-green-100 text-green-900"
                  : "bg-red-100 text-red-900"
                : evaluation.cp !== undefined && evaluation.cp > 0
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
            }`}
          >
            {formatEvaluation(evaluation)}
          </div>
        )}
      </div>
      {isEnabled && (
        <div className="text-xs mt-2 px-2 py-1.5 rounded-md bg-muted/50 border border-border/30 min-h-[2.5rem] h-[2.5rem]">
          {evaluation &&
            evaluation.pv &&
            evaluation.pv.length > 0 &&
            fen &&
            (() => {
              const bestLine = convertUciToSan(evaluation.pv.slice(0, 8), fen);
              return bestLine.length > 0 ? (
                <span className="font-mono text-foreground">
                  {formatBestLineWithMoveNumbers(bestLine, fen)}
                </span>
              ) : null;
            })()}
        </div>
      )}
    </div>
  );
}
