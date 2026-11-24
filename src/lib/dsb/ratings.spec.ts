import { describe, expect, it } from "vitest";
import {
  getRatingSyncOutcome,
  isEloMissingAtDsb,
  mergeDsbRatings,
  resolveFideData,
  type FideData,
  type Ratings,
} from "./ratings";

const previous: Ratings = {
  dwzRating: 2050,
  fideRating: 2056,
  fideId: "1234567",
};

const dsb: Ratings = {
  dwzRating: 2073,
  fideRating: 2053,
  fideId: "1234567",
};

const nothing: Ratings = { dwzRating: null, fideRating: null, fideId: null };

describe("mergeDsbRatings", () => {
  it("takes every value the DSB delivers", () => {
    expect(mergeDsbRatings({ previous, dsb })).toEqual(dsb);
  });

  it("replaces a stored FIDE ID that differs from the DSB", () => {
    expect(
      mergeDsbRatings({ previous: { ...previous, fideId: "7654321" }, dsb })
        .fideId,
    ).toBe("1234567");
  });

  it("keeps stored values the DSB does not deliver", () => {
    expect(mergeDsbRatings({ previous, dsb: nothing })).toEqual(previous);
  });
});

describe("getRatingSyncOutcome", () => {
  it("is updated when a DSB value differs from the stored one", () => {
    expect(getRatingSyncOutcome({ previous, dsb })).toBe("updated");
  });

  it("is updated when the DSB adds a FIDE ID", () => {
    expect(
      getRatingSyncOutcome({
        previous: { ...dsb, fideId: null },
        dsb,
      }),
    ).toBe("updated");
  });

  it("is unchanged when the DSB confirms every delivered value", () => {
    expect(
      getRatingSyncOutcome({
        previous: dsb,
        dsb: { ...dsb, fideRating: null },
      }),
    ).toBe("unchanged");
  });

  it("is withoutRating when the DSB delivers nothing", () => {
    expect(getRatingSyncOutcome({ previous, dsb: nothing })).toBe(
      "withoutRating",
    );
  });

  it("is withoutRating when the DSB only confirms the FIDE ID", () => {
    expect(
      getRatingSyncOutcome({
        previous,
        dsb: { ...nothing, fideId: previous.fideId },
      }),
    ).toBe("withoutRating");
  });

  it("is updated when the DSB only corrects the FIDE ID", () => {
    expect(
      getRatingSyncOutcome({
        previous,
        dsb: { ...nothing, fideId: "7654321" },
      }),
    ).toBe("updated");
  });
});

describe("isEloMissingAtDsb", () => {
  it("flags a stored Elo the DSB does not confirm", () => {
    expect(
      isEloMissingAtDsb({ previous, dsb: { ...dsb, fideRating: null } }),
    ).toBe(true);
  });

  it("does not flag a player without any Elo", () => {
    expect(
      isEloMissingAtDsb({
        previous: { ...previous, fideRating: null },
        dsb: nothing,
      }),
    ).toBe(false);
  });
});

describe("resolveFideData", () => {
  const stored: FideData = {
    fideId: "1234567",
    fideRating: 2056,
    nationality: "AUT",
    title: "IM",
    birthYear: 1990,
    gender: "m",
  };

  it("prefers every value the DSB delivers", () => {
    const fromDsb: FideData = {
      fideId: "7654321",
      fideRating: 2053,
      nationality: "GER",
      title: "FM",
      birthYear: 1991,
      gender: "f",
    };
    expect(resolveFideData(stored, fromDsb)).toEqual(fromDsb);
  });

  it("keeps stored values the DSB does not deliver", () => {
    expect(
      resolveFideData(stored, {
        fideId: null,
        fideRating: null,
        nationality: null,
        title: null,
        birthYear: null,
        gender: null,
      }),
    ).toEqual(stored);
  });
});
