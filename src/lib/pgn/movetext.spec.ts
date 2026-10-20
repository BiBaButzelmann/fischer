import { describe, it, expect } from "vitest";
import { parsePgnMoves, toMovetext, toPgn } from "./movetext";
import type { PgnHeaders } from "./headers";

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

describe("toPgn", () => {
  const headers: PgnHeaders = {
    Event: "HSK Klubturnier 2026 Gruppe B1",
    Site: "Hamburg GER",
    Date: "2026.10.15",
    Round: "3",
    White: "Wiethuechter, Samuel",
    Black: "Mueller, Kai",
    Result: "1-0",
  };

  it("renders the headers followed by the movetext and the result", () => {
    expect(toPgn(parsePgnMoves("1. e4 e5 2. Nf3"), headers)).toBe(
      `[Event "HSK Klubturnier 2026 Gruppe B1"]
[Site "Hamburg GER"]
[Date "2026.10.15"]
[Round "3"]
[White "Wiethuechter, Samuel"]
[Black "Mueller, Kai"]
[Result "1-0"]

1. e4 e5 2. Nf3 1-0`,
    );
  });

  it("escapes quotes and backslashes in tag values", () => {
    const pgn = toPgn([], { ...headers, White: 'Doe "Jr" \\ John' });

    expect(pgn).toContain('[White "Doe \\"Jr\\" \\\\ John"]');
  });
});
