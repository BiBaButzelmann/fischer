import { describe, expect, it } from "vitest";
import {
  currentFideData,
  diffDsbRatings,
  hasRatingData,
  toStoredRatingUpdate,
  type StoredRatings,
} from "./ratings";
import type { DsbPerson } from "./types";

const person: DsbPerson = {
  uuid: "f3495840-4ff8-11ee-a699-0050561f324c",
  nuLigaPersonId: "NU4009059",
  firstname: "Max",
  lastname: "Mustermann",
  birthyear: 1990,
  gender: "MALE",
  fideId: 1234567,
  rating: 2073,
  index: 70,
  memberships: [],
  weekOfLastTournamentEvaluation: "202644",
  fideRatingStandard: 2053,
  fideCountry: "GER",
};

const stored: StoredRatings = {
  dwzRating: 2050,
  fideRating: 2056,
  fideId: "1234567",
};

describe("diffDsbRatings", () => {
  it("takes DWZ and Elo from the DSB person", () => {
    expect(diffDsbRatings(stored, person)).toEqual({
      dwz: { previous: 2050, next: 2073 },
      elo: { previous: 2056, next: 2053 },
      fideId: null,
      eloMissingAtDsb: false,
    });
  });

  it("adds the DSB FIDE ID when none is stored", () => {
    const diff = diffDsbRatings({ ...stored, fideId: null }, person);
    expect(diff.fideId).toEqual({ previous: null, next: "1234567" });
  });

  it("replaces a stored FIDE ID that differs from the DSB", () => {
    const diff = diffDsbRatings({ ...stored, fideId: "7654321" }, person);
    expect(diff.fideId).toEqual({ previous: "7654321", next: "1234567" });
    expect(diff.elo).toEqual({ previous: 2056, next: 2053 });
  });

  it("flags a stored Elo the DSB does not confirm", () => {
    const diff = diffDsbRatings(stored, {
      ...person,
      fideRatingStandard: undefined,
    });
    expect(diff.elo).toBeNull();
    expect(diff.eloMissingAtDsb).toBe(true);
  });

  it("reports nothing when the DSB has no ratings", () => {
    const diff = diffDsbRatings(
      { dwzRating: null, fideRating: null, fideId: null },
      { ...person, rating: null, fideId: null, fideRatingStandard: undefined },
    );
    expect(diff).toEqual({
      dwz: null,
      elo: null,
      fideId: null,
      eloMissingAtDsb: false,
    });
    expect(hasRatingData(diff)).toBe(false);
  });
});

describe("toStoredRatingUpdate", () => {
  it("contains only the values the DSB delivered", () => {
    const diff = diffDsbRatings({ ...stored, fideId: null }, {
      ...person,
      rating: null,
    });
    expect(toStoredRatingUpdate(diff)).toEqual({
      fideRating: 2053,
      fideId: "1234567",
    });
  });
});

describe("currentFideData", () => {
  it("prefers the DSB values", () => {
    const diff = diffDsbRatings({ ...stored, fideId: null }, person);
    expect(currentFideData(stored, diff)).toEqual({
      fideId: "1234567",
      fideRating: 2053,
    });
  });

  it("falls back to the stored values without DSB data", () => {
    expect(currentFideData(stored, null)).toEqual({
      fideId: "1234567",
      fideRating: 2056,
    });
  });
});
