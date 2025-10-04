"use client";

import { useState } from "react";
import { useStockfish } from "@/hooks/use-stockfish";
import { formatUciMovesAsNotation } from "@/lib/chess-notation";
import { formatEvaluationScore } from "@/lib/stockfish-utils";

type Props = {
  fen: string;
};

export function EnginePanel({ fen }: Props) {
  const [isEnabled, setIsEnabled] = useState(false);
  const { evaluation } = useStockfish({
    fen,
    isEnabled,
  });

  const handleToggle = () => {
    setIsEnabled(!isEnabled);
  };

  return (
    <div className="flex flex-col space-y-3 p-4 pb-3 flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggle}
            className={`relative w-9 h-5 rounded-full transition-colors ${
              isEnabled ? "bg-primary" : "bg-input"
            }`}
            title={isEnabled ? "Engine ausschalten" : "Engine einschalten"}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-background rounded-full transition-transform shadow-sm ${
                isEnabled ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
          <span className="text-sm font-medium text-muted-foreground">
            Stockfish 17.1
          </span>
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
            {formatEvaluationScore(evaluation)}
          </div>
        )}
      </div>
      {isEnabled && (
        <div className="text-xs px-2 py-1.5 rounded-md bg-muted/50 border border-border/30 min-h-[2.5rem] h-[2.5rem] border-t">
          {evaluation && evaluation.pv && evaluation.pv.length > 0 && (
            <span className="font-mono text-foreground">
              {formatUciMovesAsNotation(evaluation.pv.slice(0, 8), fen)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
