import type { StockfishEvaluation, EngineConfig } from "@/types/stockfish";
import {
  parseUciInfoLine,
  calculateThreadCount,
  calculateHashSize,
} from "@/lib/stockfish-utils";

type StockfishInstance = {
  addMessageListener: (callback: (message: string) => void) => void;
  postMessage: (message: string) => void;
};

type MessageCallback = (evaluation: StockfishEvaluation | null) => void;
type StatusCallback = (status: "ready" | "analyzing" | "idle") => void;

export class StockfishService {
  private static instance: StockfishService | null = null;
  private engine: StockfishInstance | null = null;
  private isInitialized = false;
  private isReady = false;
  private messageCallbacks: Set<MessageCallback> = new Set();
  private statusCallbacks: Set<StatusCallback> = new Set();
  private currentEvaluation: StockfishEvaluation | null = null;
  private isAnalyzing = false;
  private currentFen: string | null = null;
  private currentDepth = 0;
  private maxDepth = 30;
  private config: EngineConfig = {
    threads: 4,
    hashSize: 128,
    multiPv: 1,
    minDepth: 10,
    maxDepth: 30,
  };

  private constructor() {}

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
          // @ts-expect-error - Stockfish is loaded from script
          const sf = await window.Stockfish();
          this.engine = sf;

          sf.addMessageListener((line: string) => {
            this.handleMessage(line);
          });

          sf.postMessage("uci");

          this.isInitialized = true;
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
      }, 10000);
    });
  }

  private handleMessage(line: string): void {
    if (line.includes("uciok")) {
      this.configureEngine();
      return;
    }

    if (line.includes("readyok")) {
      this.isReady = true;
      this.notifyStatusChange("ready");
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
        this.notifyStatusChange("idle");
      }
    }
  }

  private configureEngine(): void {
    if (!this.engine) return;

    const threads = calculateThreadCount(this.config.threads);
    const hashSize = calculateHashSize(this.config.hashSize);

    this.engine.postMessage(`setoption name Threads value ${threads}`);
    this.engine.postMessage(`setoption name Hash value ${hashSize}`);
    this.engine.postMessage(
      `setoption name MultiPV value ${this.config.multiPv}`,
    );
    this.engine.postMessage("isready");
  }

  analyzePosition(fen: string, maxDepth = 30): void {
    if (!this.engine || !this.isReady) return;

    if (this.isAnalyzing) {
      this.engine.postMessage("stop");
    }

    this.currentFen = fen;
    this.maxDepth = maxDepth;
    this.currentDepth = 0;
    this.currentEvaluation = null;
    this.isAnalyzing = true;
    this.notifyStatusChange("analyzing");

    setTimeout(() => {
      if (this.engine && this.currentFen === fen) {
        this.engine.postMessage(`position fen ${fen}`);
        this.engine.postMessage(`go depth ${this.config.minDepth}`);
      }
    }, 50);
  }

  private continueAnalysis(): void {
    if (!this.engine || !this.currentFen || !this.isAnalyzing) return;

    const nextDepth = Math.min(this.currentDepth + 5, this.maxDepth);

    setTimeout(() => {
      if (this.engine && this.currentFen && this.isAnalyzing) {
        this.engine.postMessage(`position fen ${this.currentFen}`);
        this.engine.postMessage(`go depth ${nextDepth}`);
      }
    }, 10);
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
    this.notifyStatusChange("idle");
  }

  getCurrentEvaluation(): StockfishEvaluation | null {
    return this.currentEvaluation;
  }

  getIsAnalyzing(): boolean {
    return this.isAnalyzing;
  }

  getIsReady(): boolean {
    return this.isReady;
  }

  subscribe(callback: MessageCallback): () => void {
    this.messageCallbacks.add(callback);
    return () => {
      this.messageCallbacks.delete(callback);
    };
  }

  subscribeStatus(callback: StatusCallback): () => void {
    this.statusCallbacks.add(callback);
    return () => {
      this.statusCallbacks.delete(callback);
    };
  }

  private notifyCallbacks(evaluation: StockfishEvaluation | null): void {
    this.messageCallbacks.forEach((callback) => {
      try {
        callback(evaluation);
      } catch (err) {
        console.error("Error in evaluation callback:", err);
      }
    });
  }

  private notifyStatusChange(status: "ready" | "analyzing" | "idle"): void {
    this.statusCallbacks.forEach((callback) => {
      try {
        callback(status);
      } catch (err) {
        console.error("Error in status callback:", err);
      }
    });
  }

  setConfig(config: Partial<EngineConfig>): void {
    this.config = { ...this.config, ...config };
    if (this.isReady) {
      this.configureEngine();
    }
  }

  getConfig(): EngineConfig {
    return { ...this.config };
  }

  destroy(): void {
    this.stopAnalysis();
    this.messageCallbacks.clear();
    this.statusCallbacks.clear();
    this.engine = null;
    this.isInitialized = false;
    this.isReady = false;
  }
}
