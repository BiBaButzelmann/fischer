import type { StockfishEvaluation } from "@/types/stockfish";

export function parseUciInfoLine(
  line: string,
  currentFen: string | null,
): StockfishEvaluation | null {
  const depthMatch = line.match(/depth (\d+)/);
  const seldepthMatch = line.match(/seldepth (\d+)/);
  const scoreMatch = line.match(/score (cp|mate) (-?\d+)/);
  const nodesMatch = line.match(/nodes (\d+)/);
  const npsMatch = line.match(/nps (\d+)/);
  const timeMatch = line.match(/time (\d+)/);
  const pvMatch = line.match(/ pv (.+)$/);
  const multipvMatch = line.match(/multipv (\d+)/);

  if (!depthMatch || !scoreMatch) return null;

  const hasUpperbound = line.includes("upperbound");
  const hasLowerbound = line.includes("lowerbound");
  if (hasUpperbound || hasLowerbound) return null;

  const depth = parseInt(depthMatch[1]);
  const seldepth = seldepthMatch ? parseInt(seldepthMatch[1]) : undefined;
  const scoreType = scoreMatch[1];
  let scoreValue = parseInt(scoreMatch[2]);
  const nodes = nodesMatch ? parseInt(nodesMatch[1]) : 0;
  const nps = npsMatch ? parseInt(npsMatch[1]) : 0;
  const time = timeMatch ? parseInt(timeMatch[1]) : 0;
  const pvString = pvMatch ? pvMatch[1] : "";
  const pv = pvString
    ? pvString.split(" ").filter((m) => /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(m))
    : [];
  const multipv = multipvMatch ? parseInt(multipvMatch[1]) : undefined;

  const isBlackToMove = currentFen?.includes(" b ") || false;
  if (isBlackToMove) {
    scoreValue = -scoreValue;
  }

  const evaluation: StockfishEvaluation = {
    depth,
    seldepth,
    nodes,
    nps,
    time,
    pv,
    multipv,
  };

  if (scoreType === "cp") {
    evaluation.cp = scoreValue;
  } else if (scoreType === "mate") {
    evaluation.mate = scoreValue;
  }

  return evaluation;
}

export function formatEvaluationScore(evaluation: StockfishEvaluation): string {
  if (evaluation.mate !== undefined) {
    return evaluation.mate > 0
      ? `M${evaluation.mate}`
      : `M${Math.abs(evaluation.mate)}`;
  }

  if (evaluation.cp !== undefined) {
    const pawns = evaluation.cp / 100;
    return pawns > 0 ? `+${pawns.toFixed(2)}` : pawns.toFixed(2);
  }

  return "0.00";
}

export function calculateThreadCount(maxThreads: number): number {
  const availableThreads =
    typeof navigator !== "undefined" ? navigator.hardwareConcurrency || 4 : 4;
  return Math.min(maxThreads, availableThreads, 32);
}

export function calculateHashSize(configuredSize: number): number {
  const availableMemory =
    typeof navigator !== "undefined"
      ? // @ts-expect-error - deviceMemory is not in all browsers
        navigator.deviceMemory
        ? // @ts-expect-error - deviceMemory is not in all browsers
          Math.min(navigator.deviceMemory * 256, 2048)
        : 256
      : 256;
  return Math.min(configuredSize, availableMemory);
}

export function getOptimalEngineConfig() {
  if (typeof navigator === "undefined") {
    return {
      threads: 4,
      hashSize: 128,
      minDepth: 10,
      maxDepth: 25,
      debounceMs: 300,
    };
  }

  const cores = navigator.hardwareConcurrency || 4;
  // @ts-expect-error - deviceMemory is not in all browsers
  const memory = navigator.deviceMemory || 4;

  if (cores >= 16 && memory >= 16) {
    return {
      threads: 16,
      hashSize: 512,
      minDepth: 14,
      maxDepth: 40,
      debounceMs: 100,
    };
  }

  if (cores >= 8 && memory >= 8) {
    return {
      threads: 8,
      hashSize: 256,
      minDepth: 12,
      maxDepth: 35,
      debounceMs: 150,
    };
  }

  if (cores >= 4 && memory >= 4) {
    return {
      threads: 4,
      hashSize: 128,
      minDepth: 10,
      maxDepth: 30,
      debounceMs: 250,
    };
  }

  return {
    threads: 2,
    hashSize: 64,
    minDepth: 8,
    maxDepth: 25,
    debounceMs: 350,
  };
}
