export type StockfishEvaluation = {
  cp?: number;
  mate?: number;
  depth: number;
  seldepth?: number;
  pv: string[];
  bestMove?: string;
};

export type EngineConfig = {
  threads: number;
  hashSize: number;
  multiPv: number;
  minDepth: number;
  maxDepth: number;
};
