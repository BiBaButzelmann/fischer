"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { StockfishService } from "@/services/stockfish-service";
import { getOptimalEngineConfig } from "@/lib/stockfish-utils";
import type { StockfishEvaluation } from "@/types/stockfish";

type UseStockfishParams = {
  fen: string;
  isEnabled: boolean;
};

export function useStockfish({ fen, isEnabled }: UseStockfishParams) {
  const { debounceMs, maxDepth } = getOptimalEngineConfig();

  const [isReady, setIsReady] = useState(false);
  const [evaluation, setEvaluation] = useState<StockfishEvaluation | null>(
    null,
  );

  const serviceRef = useRef<StockfishService | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    let unsubscribe: (() => void) | undefined;
    let unsubscribeReady: (() => void) | undefined;

    const initEngine = async () => {
      if (!StockfishService.wasmThreadsSupported()) {
        return;
      }

      const service = StockfishService.getInstance();
      serviceRef.current = service;

      unsubscribe = service.subscribe((evaluation) => {
        if (mountedRef.current && evaluation) {
          setEvaluation(evaluation);
        }
      });

      unsubscribeReady = service.onReady(() => {
        if (mountedRef.current) {
          setIsReady(true);
        }
      });

      await service.initialize();
    };

    initEngine();

    return () => {
      mountedRef.current = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      unsubscribe?.();
      unsubscribeReady?.();
    };
  }, []);

  const startAnalysis = useCallback(
    (fen: string) => {
      if (!serviceRef.current || !isReady) return;

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      serviceRef.current.stopAnalysis();

      debounceTimerRef.current = setTimeout(() => {
        serviceRef.current?.analyzePosition(fen, maxDepth);
      }, debounceMs);
    },
    [isReady, debounceMs, maxDepth],
  );

  const stopAnalysis = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    serviceRef.current?.stopAnalysis();
    setEvaluation(null);
  }, []);

  useEffect(() => {
    if (!isEnabled) {
      stopAnalysis();
      return;
    }

    // Only start analysis if both engine is ready and we have a FEN
    if (isReady && fen) {
      startAnalysis(fen);
    }
  }, [fen, isReady, isEnabled, startAnalysis, stopAnalysis]);

  return { evaluation };
}
