import type { StockfishEvaluation, EngineConfig } from "@/types/stockfish";
import {
  parseUciInfoLine,
  getOptimalEngineConfig,
} from "@/lib/stockfish-utils";

type StockfishInstance = {
  addMessageListener: (callback: (message: string) => void) => void;
  postMessage: (message: string) => void;
};

type MessageCallback = (evaluation: StockfishEvaluation | null) => void;
type ReadyCallback = () => void;

export class StockfishService {
  private static instance: StockfishService | null = null;
  private engine: StockfishInstance | null = null;
  private isInitialized = false;
  private isReady = false;
  private messageCallbacks: Set<MessageCallback> = new Set();
  private readyCallbacks: Set<ReadyCallback> = new Set();
  private currentEvaluation: StockfishEvaluation | null = null;
  private isAnalyzing = false;
  private currentFen: string | null = null;
  private currentDepth = 0;
  private maxDepth = 30;
  private config: EngineConfig;
  private pendingAnalysis: { fen: string; maxDepth: number } | null = null;

  private constructor() {
    const config = getOptimalEngineConfig();
    this.config = {
      threads: config.threads,
      hashSize: config.hashSize,
      multiPv: 1,
      minDepth: config.minDepth,
      maxDepth: config.maxDepth,
    };
  }

  static getInstance(): StockfishService {
    if (!StockfishService.instance) {
      StockfishService.instance = new StockfishService();
    }
    return StockfishService.instance;
  }

  static wasmThreadsSupported(): boolean {
    if (typeof window === "undefined") return false;

    const source = Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00);
    if (
      typeof WebAssembly !== "object" ||
      typeof WebAssembly.validate !== "function"
    )
      return false;
    if (!WebAssembly.validate(source)) return false;

    if (typeof SharedArrayBuffer !== "function") return false;
    if (typeof Atomics !== "object") return false;

    try {
      const mem = new WebAssembly.Memory({
        shared: true,
        initial: 8,
        maximum: 16,
      });
      if (!(mem.buffer instanceof SharedArrayBuffer)) return false;

      window.postMessage(mem, "*");

      try {
        mem.grow(8);
      } catch {
        // Growable memory is optional
      }

      return true;
    } catch {
      return false;
    }
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (!StockfishService.wasmThreadsSupported()) {
      throw new Error("WASM Threading wird nicht unterstützt");
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "/stockfish.js";

      script.onload = async () => {
        try {
          const sf = await window.Stockfish();
          this.engine = sf;

          sf.addMessageListener((line: string) => {
            this.handleMessage(line);
          });

          sf.postMessage("uci");

          this.isInitialized = true;
          resolve();
        } catch {
          reject(new Error("Fehler beim Initialisieren der Engine"));
        }
      };

      script.onerror = () => {
        reject(new Error("Fehler beim Laden der Engine"));
      };

      document.head.appendChild(script);

      setTimeout(() => {
        if (!this.isReady) {
          reject(new Error("Engine-Initialisierung Timeout"));
        }
      }, 3000);
    });
  }

  private handleMessage(line: string): void {
    if (line.includes("uciok")) {
      this.configureEngine();
      return;
    }

    if (line.includes("readyok")) {
      this.isReady = true;
      this.notifyReady();
      return;
    }

    if (line.startsWith("info") && line.includes("depth")) {
      if (!this.isAnalyzing || !this.currentFen) return;

      const evaluation = parseUciInfoLine(line, this.currentFen);
      if (evaluation) {
        this.currentEvaluation = evaluation;
        this.currentDepth = evaluation.depth;
        this.notifyCallbacks(evaluation);
      }
      return;
    }

    if (line.startsWith("bestmove")) {
      if (this.pendingAnalysis) {
        const { fen, maxDepth } = this.pendingAnalysis;
        this.pendingAnalysis = null;
        this.startNewAnalysis(fen, maxDepth);
        return;
      }

      if (!this.isAnalyzing || !this.currentFen) return;

      const bestMove = line.split(" ")[1];
      if (this.currentEvaluation) {
        this.currentEvaluation.bestMove = bestMove;
        this.notifyCallbacks(this.currentEvaluation);
      }

      if (
        this.currentDepth < this.maxDepth &&
        this.currentFen &&
        this.isAnalyzing
      ) {
        this.continueAnalysis();
      } else {
        this.isAnalyzing = false;
      }
    }
  }

  private configureEngine(): void {
    if (!this.engine) return;

    this.engine.postMessage(
      `setoption name Threads value ${this.config.threads}`,
    );
    this.engine.postMessage(
      `setoption name Hash value ${this.config.hashSize}`,
    );
    this.engine.postMessage(
      `setoption name MultiPV value ${this.config.multiPv}`,
    );
    this.engine.postMessage("setoption name Contempt value 0");
    this.engine.postMessage("setoption name Ponder value false");
    this.engine.postMessage("setoption name Move Overhead value 10");
    this.engine.postMessage("isready");
  }

  analyzePosition(fen: string, maxDepth = 30): void {
    if (!this.engine || !this.isReady) return;

    if (this.isAnalyzing) {
      this.pendingAnalysis = { fen, maxDepth };
      this.engine.postMessage("stop");
    } else {
      this.startNewAnalysis(fen, maxDepth);
    }
  }

  private startNewAnalysis(fen: string, maxDepth: number): void {
    this.currentFen = fen;
    this.maxDepth = maxDepth;
    this.currentDepth = 0;
    this.currentEvaluation = null;
    this.isAnalyzing = true;

    this.engine!.postMessage(`position fen ${fen}`);
    this.engine!.postMessage(`go depth ${this.config.minDepth}`);
  }

  private continueAnalysis(): void {
    if (!this.engine || !this.currentFen || !this.isAnalyzing) return;

    const increment = this.currentDepth < 20 ? 4 : 3;
    const nextDepth = Math.min(this.currentDepth + increment, this.maxDepth);

    this.engine.postMessage(`position fen ${this.currentFen}`);
    this.engine.postMessage(`go depth ${nextDepth}`);
  }

  stopAnalysis(): void {
    if (!this.engine) return;

    if (this.isAnalyzing) {
      this.engine.postMessage("stop");
    }

    this.currentFen = null;
    this.isAnalyzing = false;
    this.currentEvaluation = null;
    this.currentDepth = 0;
    this.pendingAnalysis = null; 
  }

  subscribe(callback: MessageCallback): () => void {
    this.messageCallbacks.add(callback);
    return () => {
      this.messageCallbacks.delete(callback);
    };
  }

  onReady(callback: ReadyCallback): () => void {
    this.readyCallbacks.add(callback);
    return () => {
      this.readyCallbacks.delete(callback);
    };
  }

  getIsReady(): boolean {
    return this.isReady;
  }

  private notifyCallbacks(evaluation: StockfishEvaluation | null): void {
    this.messageCallbacks.forEach((callback) => {
      callback(evaluation);
    });
  }

  private notifyReady(): void {
    this.readyCallbacks.forEach((callback) => {
      callback();
    });
  }
}
