import { describe, it, expect } from "vitest";
import { buildPgnHeaders, type PgnGame, type PgnPlayer } from "./headers";

function player(
  firstName: string,
  lastName: string,
  fide: Partial<Omit<PgnPlayer, "profile">> = {},
): PgnPlayer {
  return {
    title: null,
    fideRating: null,
    fideId: null,
    ...fide,
    profile: { firstName, lastName },
  };
}

function game(overrides: Partial<PgnGame> = {}): PgnGame {
  return {
    round: 3,
    result: "1:0",
    whiteParticipant: player("Samuel", "Wiethüchter"),
    blackParticipant: player("Kai", "Müller"),
    group: { groupName: "B1" },
    matchdayGame: { matchday: { date: "2026-10-15" } },
    ...overrides,
  };
}

const tournament = { name: "Klubturnier 2026", location: "Hamburg" };

describe("buildPgnHeaders", () => {
  it("builds the seven tag roster from the game", () => {
    expect(buildPgnHeaders(game(), tournament)).toEqual({
      Event: "HSK Klubturnier 2026 Gruppe B1",
      Site: "Hamburg GER",
      Date: "2026.10.15",
      Round: "3",
      White: "Wiethuechter, Samuel",
      Black: "Mueller, Kai",
      Result: "1-0",
    });
  });

  it("takes the site from the tournament location", () => {
    const headers = buildPgnHeaders(game(), {
      ...tournament,
      location: "Berlin",
    });

    expect(headers.Site).toBe("Berlin GER");
  });

  it("normalizes whitespace in player names", () => {
    const headers = buildPgnHeaders(
      game({
        whiteParticipant: player("Dominik ", " Müller-Peters "),
        blackParticipant: player("\t Lionel", "von  Flottwell"),
      }),
      tournament,
    );

    expect([headers.White, headers.Black]).toEqual([
      "Mueller-Peters, Dominik",
      "von Flottwell, Lionel",
    ]);
  });

  it.each([
    ["0:1", "0-1"],
    ["½-½", "1/2-1/2"],
    ["0-½", "*"],
    [null, "*"],
  ] as const)(
    "maps the game result %s to the PGN result %s",
    (result, pgnResult) => {
      expect(buildPgnHeaders(game({ result }), tournament).Result).toBe(
        pgnResult,
      );
    },
  );

  it("adds FIDE title, rating and id for players that have them", () => {
    const headers = buildPgnHeaders(
      game({
        whiteParticipant: player("Andrés Mauricio", "Reyes Mantilla", {
          title: "FM",
          fideRating: 2105,
          fideId: " 4467248",
        }),
      }),
      tournament,
    );

    expect(headers).toMatchObject({
      WhiteTitle: "FM",
      WhiteElo: "2105",
      WhiteFideId: "4467248",
    });
    expect([headers.BlackTitle, headers.BlackElo, headers.BlackFideId]).toEqual(
      [undefined, undefined, undefined],
    );
  });

  it("omits the Elo of unrated players stored with rating 0", () => {
    const headers = buildPgnHeaders(
      game({
        whiteParticipant: player("Klaus", "von Bargen", { fideRating: 0 }),
      }),
      tournament,
    );

    expect(headers.WhiteElo).toBeUndefined();
  });
});
