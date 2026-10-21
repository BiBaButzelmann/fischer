import { describe, it, expect } from "vitest";
import { parsePgnMoves, toMovetext } from "./movetext";

describe("parsePgnMoves", () => {
  it("returns the moves of a standard PGN", () => {
    const pgn = `[Event "Klubturnier 2026"]
[Result "1/2-1/2"]

1. e4 e5 2. Nf3 Nc6 1/2-1/2`;

    expect(parsePgnMoves(pgn).map((move) => move.san)).toEqual([
      "e4",
      "e5",
      "Nf3",
      "Nc6",
    ]);
  });

  it("rejects a PGN with a non-standard ½-½ result", () => {
    const pgn = `[Event "Klubturnier 2025"]
[Result "½-½"]

1. e4 e5 2. Nf3 Nc6 ½-½`;

    expect(() => parsePgnMoves(pgn)).toThrow();
  });
});

describe("toMovetext", () => {
  it("serializes moves as numbered movetext without headers and result", () => {
    const moves = parsePgnMoves(`[White "?"]

1. e4 e5 2. Nf3 *`);

    expect(toMovetext(moves)).toBe("1. e4 e5 2. Nf3");
  });
});
