"use client";

import { useEffect } from "react";
import { useStockfish } from "@/hooks/use-stockfish";

type Props = {
  fen: string;
  className?: string;
  showDetails?: boolean;
  maxDepth?: number;
};

export function PositionEvaluation({
  fen,
  className = "",
  showDetails = true,
  maxDepth = 30,
}: Props) {
  const {
    isReady,
    evaluation,
    isAnalyzing,
    error,
    progress,
    analyzePosition,
    formatEvaluation,
    formatNodes,
    formatNps,
    wasmSupported,
  } = useStockfish({ maxDepth, debounceMs: 300 });

  useEffect(() => {
    if (isReady && fen) {
      analyzePosition(fen);
    }
  }, [fen, isReady, analyzePosition]);

  if (!wasmSupported) {
    return (
      <div className={`text-xs text-gray-500 ${className}`}>
        WASM Threading nicht unterstützt
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-xs text-red-500 ${className}`}>Engine Fehler</div>
    );
  }

  if (!isReady) {
    return (
      <div className={`text-xs text-gray-500 ${className}`}>Engine lädt...</div>
    );
  }

  if (!evaluation && isAnalyzing) {
    return (
      <div className={`text-xs text-blue-500 ${className}`}>Analysiert...</div>
    );
  }

  if (!evaluation) {
    return <div className={`text-xs text-gray-500 ${className}`}>-</div>;
  }

  const evalText = formatEvaluation(evaluation);
  const isPositive = evaluation.cp
    ? evaluation.cp > 0
    : evaluation.mate
      ? evaluation.mate > 0
      : false;
  const isMate = evaluation.mate !== undefined;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
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

        {isAnalyzing && (
          <div className="flex items-center gap-1 text-xs text-blue-600">
            <div className="animate-pulse">⚡</div>
            <span>Analysiert...</span>
          </div>
        )}
      </div>

      {showDetails && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Tiefe:</span>
            <span className="font-mono font-medium">
              {evaluation.depth}
              {evaluation.seldepth && ` / ${evaluation.seldepth}`}
            </span>
          </div>

          {evaluation.nodes > 0 && (
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Knoten:</span>
              <span className="font-mono">{formatNodes(evaluation.nodes)}</span>
            </div>
          )}

          {evaluation.nps > 0 && (
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Geschw.:</span>
              <span className="font-mono">{formatNps(evaluation.nps)}</span>
            </div>
          )}

          {evaluation.bestMove && (
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Bester Zug:</span>
              <span className="font-mono font-medium text-blue-700">
                {evaluation.bestMove}
              </span>
            </div>
          )}

          {isAnalyzing && progress > 0 && (
            <div className="mt-2">
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 text-right mt-0.5">
                {Math.round(progress)}%
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
