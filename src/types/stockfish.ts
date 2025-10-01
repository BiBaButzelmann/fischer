export type StockfishEvaluation = {
  cp?: number;
  mate?: number;
  depth: number;
  seldepth?: number;
  nodes: number;
  nps: number;
  time: number;
  pv: string[];
  multipv?: number;
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
