import { describe, it, expect } from "vitest";
import { buildPgnFileName, type PgnFileNameGame } from "./file-name";

const game: PgnFileNameGame = {
  whiteParticipantId: 11,
  blackParticipantId: 12,
  whiteParticipant: {
    profile: { firstName: "Samuel", lastName: "Wiethüchter" },
  },
  blackParticipant: { profile: { firstName: "Kai", lastName: "Müller" } },
  group: { groupName: "B1" },
  matchdayGame: { matchday: { date: "2026-10-15" } },
};

describe("buildPgnFileName", () => {
  it("names the file after the tournament and the selected group", () => {
    expect(buildPgnFileName("Klubturnier 2026", { groupId: 3 }, [game])).toBe(
      "Klubturnier_2026_B1.pgn",
    );
  });

  it("adds the round and the matchday date", () => {
    expect(
      buildPgnFileName("Klubturnier 2026", { round: 3, matchdayId: 7 }, [game]),
    ).toBe("Klubturnier_2026_Runde_3_15_10_2026.pgn");
  });

  it("uses the selected participant instead of the group", () => {
    expect(
      buildPgnFileName("Klubturnier 2026", { groupId: 3, participantId: 12 }, [
        game,
      ]),
    ).toBe("Klubturnier_2026_Kai_Müller.pgn");
  });
});
