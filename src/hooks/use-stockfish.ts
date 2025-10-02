"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { StockfishService } from "@/services/stockfish-service";
import {
  formatEvaluationScore,
  getOptimalEngineConfig,
} from "@/lib/stockfish-utils";
import type { StockfishEvaluation } from "@/types/stockfish";

type UseStockfishOptions = {
  debounceMs?: number;
  maxDepth?: number;
};

export function useStockfish(options: UseStockfishOptions = {}) {
  const optimalConfig = getOptimalEngineConfig();
  const {
    debounceMs = optimalConfig.debounceMs,
    maxDepth = optimalConfig.maxDepth,
  } = options;

  const [isReady, setIsReady] = useState(false);
  const [evaluation, setEvaluation] = useState<StockfishEvaluation | null>(
    null,
  );
  const [isEnabled, setIsEnabled] = useState(false);

  const serviceRef = useRef<StockfishService | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  const currentFenRef = useRef<string | null>(null);

  useEffect(() => {
    mountedRef.current = true;

    const initEngine = async () => {
      try {
        if (!StockfishService.wasmThreadsSupported()) {
          return;
        }

        const service = StockfishService.getInstance();
        serviceRef.current = service;

        const unsubscribe = service.subscribe((evaluation) => {
          if (mountedRef.current && evaluation) {
            setEvaluation(evaluation);
          }
        });

        const unsubscribeStatus = service.subscribeStatus((status) => {
          if (!mountedRef.current) return;

          if (status === "ready") {
            setIsReady(true);
          }
        });

        await service.initialize();

        return () => {
          unsubscribe();
          unsubscribeStatus();
        };
      } catch {
        return undefined;
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
      if (!serviceRef.current || !isReady || !isEnabled) return;

      currentFenRef.current = fen;

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      serviceRef.current.stopAnalysis();

      debounceTimerRef.current = setTimeout(() => {
        serviceRef.current?.analyzePosition(fen, depth ?? maxDepth);
      }, debounceMs);
    },
    [isReady, isEnabled, debounceMs, maxDepth],
  );

  const toggleEngine = useCallback(() => {
    setIsEnabled((prev) => {
      const newState = !prev;
      if (!newState) {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        serviceRef.current?.stopAnalysis();
        setEvaluation(null);
      } else if (currentFenRef.current && serviceRef.current && isReady) {
        serviceRef.current.analyzePosition(currentFenRef.current, maxDepth);
      }
      return newState;
    });
  }, [isReady, maxDepth]);

  const formatEvaluation = useCallback(
    (evaluation: StockfishEvaluation): string => {
      return formatEvaluationScore(evaluation);
    },
    [],
  );

  return {
    isReady,
    evaluation,
    analyzePosition,
    formatEvaluation,
    isEnabled,
    toggleEngine,
  };
}
