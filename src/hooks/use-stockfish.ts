"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { StockfishService } from "@/services/stockfish-service";
import { formatEvaluationScore } from "@/lib/stockfish-utils";
import type { StockfishEvaluation } from "@/types/stockfish";

type UseStockfishOptions = {
  debounceMs?: number;
  maxDepth?: number;
};

export function useStockfish(options: UseStockfishOptions = {}) {
  const { debounceMs = 500, maxDepth = 30 } = options;

  const [isReady, setIsReady] = useState(false);
  const [evaluation, setEvaluation] = useState<StockfishEvaluation | null>(
    null,
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const serviceRef = useRef<StockfishService | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const initEngine = async () => {
      try {
        if (!StockfishService.wasmThreadsSupported()) {
          setError("WASM Threading wird nicht unterstützt");
          return;
        }

        const service = StockfishService.getInstance();
        serviceRef.current = service;

        const unsubscribe = service.subscribe((evaluation) => {
          if (mountedRef.current && evaluation) {
            setEvaluation(evaluation);
            const progressPercent = (evaluation.depth / maxDepth) * 100;
            setProgress(Math.min(progressPercent, 100));
          }
        });

        const unsubscribeStatus = service.subscribeStatus((status) => {
          if (!mountedRef.current) return;

          if (status === "ready") {
            setIsReady(true);
          } else if (status === "analyzing") {
            setIsAnalyzing(true);
          } else if (status === "idle") {
            setIsAnalyzing(false);
          }
        });

        await service.initialize();

        return () => {
          unsubscribe();
          unsubscribeStatus();
        };
      } catch (err) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err.message : "Engine-Fehler");
        }
      }
    };

    const cleanup = initEngine();

    return () => {
      mountedRef.current = false;
      cleanup.then((fn) => fn?.());
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [maxDepth]);

  const analyzePosition = useCallback(
    (fen: string, depth?: number) => {
      if (!serviceRef.current || !isReady) return;

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      serviceRef.current.stopAnalysis();
      setProgress(0);

      debounceTimerRef.current = setTimeout(() => {
        serviceRef.current?.analyzePosition(fen, depth ?? maxDepth);
      }, debounceMs);
    },
    [isReady, debounceMs, maxDepth],
  );

  const analyzePositionImmediate = useCallback(
    (fen: string, depth?: number) => {
      if (!serviceRef.current || !isReady) return;

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      serviceRef.current.stopAnalysis();
      setProgress(0);
      serviceRef.current.analyzePosition(fen, depth ?? maxDepth);
    },
    [isReady, maxDepth],
  );

  const stopAnalysis = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    serviceRef.current?.stopAnalysis();
  }, []);

  const formatEvaluation = useCallback(
    (evaluation: StockfishEvaluation): string => {
      return formatEvaluationScore(evaluation);
    },
    [],
  );

  return {
    isReady,
    evaluation,
    isAnalyzing,
    error,
    progress,
    analyzePosition,
    analyzePositionImmediate,
    stopAnalysis,
    formatEvaluation,
    wasmSupported: StockfishService.wasmThreadsSupported(),
  };
}
