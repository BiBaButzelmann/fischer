export type StockfishEvaluation = {
  cp?: number;
  mate?: number;
  depth: number;
  seldepth?: number;
  pv: string[];
  bestMove?: string;
};

export type EngineStatus =
  | "idle"
  | "initializing"
  | "ready"
  | "analyzing"
  | "error";

export type StockfishMessage = {
  type: "uciok" | "readyok" | "info" | "bestmove" | "error";
  line: string;
};

export type EngineConfig = {
  threads: number;
  hashSize: number;
  multiPv: number;
  minDepth: number;
  maxDepth: number;
};
