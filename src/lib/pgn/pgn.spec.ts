import { describe, it, expect } from "vitest";
import { toPgn } from "./pgn";
import { parsePgnMoves } from "./movetext";
import type { PgnHeaders } from "./headers";

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
