import { describe, test, expect } from "vitest";
import { getTwz, formatTwz, sortParticipantsByTwz } from "../twz";
import type { ParticipantWithName } from "@/db/types/participant";

function makeParticipant(
  fideRating: number | null,
  dwzRating: number | null,
  lastName: string,
): ParticipantWithName {
  return {
    fideRating,
    dwzRating,
    profile: { firstName: "Test", lastName },
  } as ParticipantWithName;
}

describe("getTwz", () => {
  test("returns the higher of both ratings", () => {
    expect(getTwz({ fideRating: 2000, dwzRating: 1850 })).toBe(2000);
    expect(getTwz({ fideRating: 1900, dwzRating: 2100 })).toBe(2100);
  });

  test("returns the only available rating", () => {
    expect(getTwz({ fideRating: 1700, dwzRating: null })).toBe(1700);
    expect(getTwz({ fideRating: null, dwzRating: 1600 })).toBe(1600);
  });

  test("returns null when no rating exists", () => {
    expect(getTwz({ fideRating: null, dwzRating: null })).toBeNull();
  });

  test("handles equal ratings", () => {
    expect(getTwz({ fideRating: 1800, dwzRating: 1800 })).toBe(1800);
  });
});

describe("formatTwz", () => {
  test("formats the TWZ as string", () => {
    expect(formatTwz({ fideRating: 2000, dwzRating: 1850 })).toBe("2000");
  });

  test("uses the fallback when no rating exists", () => {
    expect(formatTwz({ fideRating: null, dwzRating: null })).toBe("-");
    expect(formatTwz({ fideRating: null, dwzRating: null }, "–")).toBe("–");
  });
});

describe("sortParticipantsByTwz", () => {
  test("sorts descending by TWZ", () => {
    const result = sortParticipantsByTwz([
      makeParticipant(1500, 1500, "Mittel"),
      makeParticipant(2200, null, "Stark"),
      makeParticipant(null, 1000, "Schwach"),
    ]);
    expect(result.map((p) => p.profile.lastName)).toEqual([
      "Stark",
      "Mittel",
      "Schwach",
    ]);
  });

  test("breaks TWZ ties by the second (lower) rating descending", () => {
    const a = makeParticipant(2000, 1850, "A");
    const b = makeParticipant(1950, 2000, "B");
    const c = makeParticipant(2000, null, "C");
    const result = sortParticipantsByTwz([a, c, b]);
    expect(result.map((p) => p.profile.lastName)).toEqual(["B", "A", "C"]);
  });

  test("places players with only one rating behind those with two at equal TWZ", () => {
    const twoRatings = makeParticipant(1800, 1700, "Zwei");
    const oneRating = makeParticipant(1800, null, "Eins");
    const result = sortParticipantsByTwz([oneRating, twoRatings]);
    expect(result.map((p) => p.profile.lastName)).toEqual(["Zwei", "Eins"]);
  });

  test("breaks full ties by last name", () => {
    const result = sortParticipantsByTwz([
      makeParticipant(2000, 1900, "Schmidt"),
      makeParticipant(2000, 1900, "Albers"),
    ]);
    expect(result.map((p) => p.profile.lastName)).toEqual([
      "Albers",
      "Schmidt",
    ]);
  });

  test("places players without any rating last", () => {
    const result = sortParticipantsByTwz([
      makeParticipant(null, null, "Ohne"),
      makeParticipant(1200, null, "Mit"),
    ]);
    expect(result.map((p) => p.profile.lastName)).toEqual(["Mit", "Ohne"]);
  });

  test("does not mutate the input array", () => {
    const input = [
      makeParticipant(1500, null, "B"),
      makeParticipant(2000, null, "A"),
    ];
    const snapshot = input.map((p) => p.profile.lastName);
    sortParticipantsByTwz(input);
    expect(input.map((p) => p.profile.lastName)).toEqual(snapshot);
  });
});
