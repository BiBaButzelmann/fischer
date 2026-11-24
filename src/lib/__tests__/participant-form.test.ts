import { describe, expect, it } from "vitest";
import { candidateToFormValues } from "../participant-form";
import type { DsbPlayerCandidate } from "../dsb/types";

const candidate: DsbPlayerCandidate = {
  nuLigaPersonId: "NU4211295",
  firstName: "Andre",
  lastName: "Martin",
  birthYear: 1962,
  dwzRating: 1764,
  fideId: "20660391",
  fideRating: 1802,
  nationality: "GER",
  title: "FM",
  gender: "m",
  clubName: "Glauchauer SC 1873",
};

const current = {
  fideId: "1234567",
  title: "IM",
  nationality: "AUT",
} as const;

describe("candidateToFormValues", () => {
  it("takes every value the DSB delivers", () => {
    expect(candidateToFormValues(candidate, current)).toEqual({
      dsbPersonId: "NU4211295",
      dwzRating: 1764,
      fideRating: 1802,
      gender: "m",
      birthYear: 1962,
      fideId: "20660391",
      title: "FM",
      nationality: "GER",
    });
  });

  it("keeps the current FIDE data the DSB lacks but never keeps ratings", () => {
    expect(
      candidateToFormValues(
        {
          ...candidate,
          dwzRating: null,
          fideRating: null,
          fideId: null,
          title: null,
          nationality: null,
        },
        current,
      ),
    ).toEqual({
      dsbPersonId: "NU4211295",
      dwzRating: undefined,
      fideRating: undefined,
      gender: "m",
      birthYear: 1962,
      ...current,
    });
  });
});
