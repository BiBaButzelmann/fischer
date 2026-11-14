import { describe, expect, test } from "vitest";
import { computeForfeitResults, type ForfeitCandidate } from "../forfeit";

function candidate(
  overrides: Partial<ForfeitCandidate> & { id: number },
): ForfeitCandidate {
  return {
    result: null,
    whiteDeactivated: false,
    blackDeactivated: false,
    ...overrides,
  };
}

describe("computeForfeitResults", () => {
  test("awards an open game to the active side", () => {
    expect(
      computeForfeitResults([
        candidate({ id: 1, whiteDeactivated: true }),
        candidate({ id: 2, blackDeactivated: true }),
      ]),
    ).toEqual([
      { gameId: 1, result: "-:+" },
      { gameId: 2, result: "+:-" },
    ]);
  });

  test("scores games between two deactivated players as -:-", () => {
    expect(
      computeForfeitResults([
        candidate({ id: 1, whiteDeactivated: true, blackDeactivated: true }),
        candidate({
          id: 2,
          result: "+:-",
          whiteDeactivated: true,
          blackDeactivated: true,
        }),
      ]),
    ).toEqual([
      { gameId: 1, result: "-:-" },
      { gameId: 2, result: "-:-" },
    ]);
  });

  test("leaves decided games and games without deactivated players alone", () => {
    expect(
      computeForfeitResults([
        candidate({ id: 1, result: "1:0", whiteDeactivated: true }),
        candidate({ id: 2, result: "+:-", blackDeactivated: true }),
        candidate({ id: 3 }),
      ]),
    ).toEqual([]);
  });

  test("is idempotent", () => {
    const games = [
      candidate({ id: 1, whiteDeactivated: true }),
      candidate({ id: 2, whiteDeactivated: true, blackDeactivated: true }),
    ];
    const updates = computeForfeitResults(games);
    const applied = games.map((game) => ({
      ...game,
      result:
        updates.find((update) => update.gameId === game.id)?.result ??
        game.result,
    }));

    expect(computeForfeitResults(applied)).toEqual([]);
  });
});
