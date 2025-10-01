"use client";

import { useEffect } from "react";
import { useStockfish } from "@/hooks/use-stockfish";

type Props = {
  fen: string;
  className?: string;
};

export function PositionEvaluation({ fen, className = "" }: Props) {
  const {
    isReady,
    evaluation,
    isAnalyzing,
    error,
    analyzePosition,
    formatEvaluation,
    wasmSupported,
  } = useStockfish();

  useEffect(() => {
    if (isReady && fen && !isAnalyzing) {
      // Analyze position with 1 second calculation time
      analyzePosition(fen, 1000);
    }
  }, [fen, isReady, analyzePosition, isAnalyzing]);

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

  if (isAnalyzing) {
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
    <div className={`text-sm font-mono ${className}`}>
      <div
        className={`px-2 py-1 rounded text-center min-w-[60px] ${
          isMate
            ? isPositive
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
            : isPositive
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
        }`}
      >
        {evalText}
      </div>
      {evaluation.depth > 0 && (
        <div className="text-xs text-gray-500 mt-1 text-center">
          Tiefe {evaluation.depth}
        </div>
      )}
    </div>
  );
}
