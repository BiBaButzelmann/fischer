"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type StockfishInstance = {
  addMessageListener: (callback: (message: string) => void) => void;
  postMessage: (message: string) => void;
};

type StockfishEvaluation = {
  cp?: number; // centipawns
  mate?: number; // mate in X moves
  depth: number;
  nodes: number;
  nps: number; // nodes per second
  pv: string; // principal variation
};

export function useStockfish() {
  const [stockfish, setStockfish] = useState<StockfishInstance | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [evaluation, setEvaluation] = useState<StockfishEvaluation | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Feature detection for WASM threads
  const wasmThreadsSupported = useCallback(() => {
    // WebAssembly 1.0
    const source = Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00);
    if (
      typeof WebAssembly !== "object" ||
      typeof WebAssembly.validate !== "function"
    )
      return false;
    if (!WebAssembly.validate(source)) return false;

    // SharedArrayBuffer
    if (typeof SharedArrayBuffer !== "function") return false;

    // Atomics
    if (typeof Atomics !== "object") return false;

    // Shared memory
    try {
      const mem = new WebAssembly.Memory({ shared: true, initial: 8, maximum: 16 });
      if (!(mem.buffer instanceof SharedArrayBuffer)) return false;

      // Structured cloning
      window.postMessage(mem, "*");

      // Growable shared memory (optional)
      try {
        mem.grow(8);
      } catch {
        // Not critical
      }

      return true;
    } catch {
      return false;
    }
  }, []);

  const parseEvaluation = useCallback((line: string) => {
    // Parse UCI info output
    // Example: info depth 20 seldepth 25 multipv 1 score cp 25 nodes 1234567 nps 123456 time 1000 pv e2e4 e7e5
    
    const depthMatch = line.match(/depth (\d+)/);
    const scoreMatch = line.match(/score (cp|mate) (-?\d+)/);
    const nodesMatch = line.match(/nodes (\d+)/);
    const npsMatch = line.match(/nps (\d+)/);
    const pvMatch = line.match(/pv (.+)$/);

    if (!depthMatch || !scoreMatch) return;

    const depth = parseInt(depthMatch[1]);
    const scoreType = scoreMatch[1];
    const scoreValue = parseInt(scoreMatch[2]);
    const nodes = nodesMatch ? parseInt(nodesMatch[1]) : 0;
    const nps = npsMatch ? parseInt(npsMatch[1]) : 0;
    const pv = pvMatch ? pvMatch[1] : "";

    const newEvaluation: StockfishEvaluation = {
      depth,
      nodes,
      nps,
      pv,
    };

    if (scoreType === "cp") {
      newEvaluation.cp = scoreValue;
    } else if (scoreType === "mate") {
      newEvaluation.mate = scoreValue;
    }

    setEvaluation(newEvaluation);
  }, []);

  // Initialize Stockfish
  useEffect(() => {
    if (!wasmThreadsSupported()) {
      setError("WASM Threading wird von diesem Browser nicht unterstützt");
      return;
    }

    let mounted = true;
    let script: HTMLScriptElement | null = null;

    const initStockfish = async () => {
      try {
        // Load Stockfish from public directory
        script = document.createElement("script");
        script.src = "/stockfish.js";
        script.onload = async () => {
          // @ts-expect-error - Stockfish is loaded from script
          const sf = await window.Stockfish();
          
          if (!mounted) return;

          sf.addMessageListener((line: string) => {
            if (line.includes("uciok")) {
              setIsReady(true);
            } else if (line.startsWith("info depth")) {
              parseEvaluation(line);
            }
          });

          setStockfish(sf);
          sf.postMessage("uci");
        };
        script.onerror = () => {
          if (mounted) {
            setError("Fehler beim Laden der Stockfish Engine");
          }
        };
        document.head.appendChild(script);
      } catch (err) {
        if (mounted) {
          setError("Fehler beim Laden der Stockfish Engine");
          console.error("Stockfish loading error:", err);
        }
      }
    };

    initStockfish();

    return () => {
      mounted = false;
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [wasmThreadsSupported, parseEvaluation]);

  const analyzePosition = useCallback((fen: string, timeMs: number = 1000) => {
    if (!stockfish || !isReady) return;

    setIsAnalyzing(true);
    setEvaluation(null);

    // Clear any existing analysis
    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current);
    }

    // Set position
    stockfish.postMessage(`position fen ${fen}`);
    
    // Start analysis
    stockfish.postMessage(`go movetime ${timeMs}`);

    // Stop analysis after timeout
    analysisTimeoutRef.current = setTimeout(() => {
      if (stockfish) {
        stockfish.postMessage("stop");
        setIsAnalyzing(false);
      }
    }, timeMs + 100);
  }, [stockfish, isReady]);

  const formatEvaluation = useCallback((evaluation: StockfishEvaluation): string => {
    if (evaluation.mate !== undefined) {
      return evaluation.mate > 0 ? `M${evaluation.mate}` : `M${Math.abs(evaluation.mate)}`;
    }
    
    if (evaluation.cp !== undefined) {
      const pawns = evaluation.cp / 100;
      return pawns > 0 ? `+${pawns.toFixed(2)}` : pawns.toFixed(2);
    }
    
    return "0.00";
  }, []);

  return {
    isReady,
    evaluation,
    isAnalyzing,
    error,
    analyzePosition,
    formatEvaluation,
    wasmSupported: wasmThreadsSupported(),
  };
}