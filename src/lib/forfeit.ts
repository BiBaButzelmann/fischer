import type { GameResult } from "@/db/types/game";

export type ForfeitCandidate = {
  id: number;
  result: GameResult | null;
  whiteDeactivated: boolean;
  blackDeactivated: boolean;
};

export type ForfeitUpdate = {
  gameId: number;
  result: GameResult;
};

const FORFEIT_RESULTS = new Set<GameResult | null>(["+:-", "-:+"]);

function resolveForfeit(game: ForfeitCandidate): GameResult | null {
  const { result, whiteDeactivated, blackDeactivated } = game;

  if (whiteDeactivated && blackDeactivated) {
    return result == null || FORFEIT_RESULTS.has(result) ? "-:-" : null;
  }
  if (result != null) {
    return null;
  }
  if (whiteDeactivated) {
    return "-:+";
  }
  if (blackDeactivated) {
    return "+:-";
  }
  return null;
}

export function computeForfeitResults(
  games: ForfeitCandidate[],
): ForfeitUpdate[] {
  return games.flatMap((game) => {
    const result = resolveForfeit(game);
    return result != null && result !== game.result
      ? [{ gameId: game.id, result }]
      : [];
  });
}
