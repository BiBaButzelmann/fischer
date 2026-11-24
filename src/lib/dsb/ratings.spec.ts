import { describe, expect, it } from "vitest";
import {
  diffDsbRatings,
  getRatingOutcome,
  resolveFideData,
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
      {
        ...person,
        rating: undefined,
        fideId: undefined,
        fideRatingStandard: undefined,
      },
    );
    expect(diff).toEqual({
      dwz: null,
      elo: null,
      fideId: null,
      eloMissingAtDsb: false,
    });
  });
});

describe("getRatingOutcome", () => {
  it("is updated when a DSB value differs from the stored one", () => {
    expect(getRatingOutcome(diffDsbRatings(stored, person))).toBe("updated");
  });

  it("is unchanged when the DSB confirms every stored value", () => {
    const confirmed = { dwzRating: 2073, fideRating: 2053, fideId: "1234567" };
    expect(getRatingOutcome(diffDsbRatings(confirmed, person))).toBe(
      "unchanged",
    );
  });

  it("is withoutRating when the DSB delivers nothing", () => {
    const diff = diffDsbRatings(stored, {
      ...person,
      rating: undefined,
      fideId: undefined,
      fideRatingStandard: undefined,
    });
    expect(getRatingOutcome(diff)).toBe("withoutRating");
  });
});

describe("toStoredRatingUpdate", () => {
  it("contains only the values the DSB delivered", () => {
    const diff = diffDsbRatings({ ...stored, fideId: null }, {
      ...person,
      rating: undefined,
    });
    expect(toStoredRatingUpdate(diff)).toEqual({
      fideRating: 2053,
      fideId: "1234567",
    });
  });
});

describe("resolveFideData", () => {
  it("prefers the DSB values", () => {
    expect(resolveFideData({ ...stored, fideId: null }, person)).toEqual({
      fideId: "1234567",
      fideRating: 2053,
    });
  });

  it("keeps stored values the DSB does not deliver", () => {
    expect(
      resolveFideData(stored, { ...person, fideRatingStandard: undefined }),
    ).toEqual({
      fideId: "1234567",
      fideRating: 2056,
    });
  });

  it("falls back to the stored values without a DSB person", () => {
    expect(resolveFideData(stored, null)).toEqual({
      fideId: "1234567",
      fideRating: 2056,
    });
  });
});
