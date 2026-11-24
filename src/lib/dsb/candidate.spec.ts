import { describe, it, expect } from "vitest";
import {
  candidateToFormValues,
  mapDsbGender,
  mapDsbPersonToCandidate,
  selectPrimaryMembership,
  transliterateGermanUmlauts,
} from "./candidate";
import type { DsbMembership, DsbPerson } from "./types";

const activeMembership: DsbMembership = {
  vkz: "F3401",
  memberNo: "34",
  clubName: "Glauchauer SC 1873",
  licenceState: "ACTIVE",
  regionName: "Chemnitz",
  federationName: "Schachverband Sachsen e.V.",
};

const inactiveMembership: DsbMembership = {
  vkz: "H0007",
  memberNo: "5",
  clubName: "SV Deggendorf",
  licenceState: "INACTIVE",
  regionName: "Niederbayern",
  federationName: "Bayerischer Schachbund e.V.",
};

const person: DsbPerson = {
  uuid: "e921e96e-4ff8-11ee-a699-0050561f324c",
  nuLigaPersonId: "NU4211295",
  firstname: "Andre",
  lastname: "Martin",
  birthyear: 1962,
  gender: "MALE",
  fideId: 20660391,
  rating: 1764,
  index: 10,
  memberships: [activeMembership],
  weekOfLastTournamentEvaluation: "202418",
  fideRatingStandard: 1802,
  fideCountry: "GER",
  fideTitle: "FM",
};

describe("selectPrimaryMembership", () => {
  it("prefers the active membership over other memberships", () => {
    expect(
      selectPrimaryMembership([inactiveMembership, activeMembership]),
    ).toBe(activeMembership);
  });

  it("falls back to the first membership when none is active", () => {
    expect(selectPrimaryMembership([inactiveMembership])).toBe(
      inactiveMembership,
    );
  });

  it("returns null when there are no memberships", () => {
    expect(selectPrimaryMembership([])).toBeNull();
  });
});

describe("transliterateGermanUmlauts", () => {
  it("folds umlauts and eszett the way the Wertungsportal matches names", () => {
    expect(transliterateGermanUmlauts("Müller")).toBe("Mueller");
    expect(transliterateGermanUmlauts("Köhler")).toBe("Koehler");
    expect(transliterateGermanUmlauts("Jörg")).toBe("Joerg");
    expect(transliterateGermanUmlauts("Straß")).toBe("Strass");
    expect(transliterateGermanUmlauts("Öztürk")).toBe("Oeztuerk");
  });

  it("leaves names without umlauts unchanged", () => {
    expect(transliterateGermanUmlauts("Martin")).toBe("Martin");
  });
});

describe("mapDsbGender", () => {
  it("maps MALE and FEMALE to the domain gender", () => {
    expect(mapDsbGender("MALE")).toBe("m");
    expect(mapDsbGender("FEMALE")).toBe("f");
  });

  it("maps a missing gender to null", () => {
    expect(mapDsbGender(null)).toBeNull();
  });
});

describe("mapDsbPersonToCandidate", () => {
  it("maps an API person to a UI candidate", () => {
    expect(mapDsbPersonToCandidate(person)).toEqual({
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
    });
  });

  it("keeps missing ratings, fide data and club as null", () => {
    const candidate = mapDsbPersonToCandidate({
      ...person,
      fideId: undefined,
      rating: undefined,
      fideRatingStandard: undefined,
      fideCountry: undefined,
      fideTitle: undefined,
      memberships: [],
    });
    expect(candidate.fideId).toBeNull();
    expect(candidate.dwzRating).toBeNull();
    expect(candidate.fideRating).toBeNull();
    expect(candidate.nationality).toBeNull();
    expect(candidate.title).toBeNull();
    expect(candidate.clubName).toBeNull();
  });

  it("prefers the open title over the women's title", () => {
    const candidate = mapDsbPersonToCandidate({
      ...person,
      fideTitle: "GM",
      fideWomenTitle: "WGM",
    });
    expect(candidate.title).toBe("GM");
  });

  it("falls back to the women's title", () => {
    const candidate = mapDsbPersonToCandidate({
      ...person,
      fideTitle: undefined,
      fideWomenTitle: "WIM",
    });
    expect(candidate.title).toBe("WIM");
  });

  it("ignores titles the app does not support", () => {
    const candidate = mapDsbPersonToCandidate({
      ...person,
      fideTitle: "AGM",
      fideWomenTitle: undefined,
    });
    expect(candidate.title).toBeNull();
  });

  it("skips an unsupported open title in favour of a supported women's title", () => {
    const candidate = mapDsbPersonToCandidate({
      ...person,
      fideTitle: "AGM",
      fideWomenTitle: "WIM",
    });
    expect(candidate.title).toBe("WIM");
  });
});

describe("candidateToFormValues", () => {
  const fallback = {
    fideId: "1234567",
    title: "IM",
    gender: "f",
    nationality: "AUT",
    birthYear: 1980,
  } as const;

  it("takes every value the DSB delivers", () => {
    expect(
      candidateToFormValues(mapDsbPersonToCandidate(person), fallback),
    ).toEqual({
      dsbPersonId: "NU4211295",
      dwzRating: 1764,
      fideRating: 1802,
      fideId: "20660391",
      title: "FM",
      gender: "m",
      nationality: "GER",
      birthYear: 1962,
    });
  });

  it("keeps person data the DSB lacks but never falls back for ratings", () => {
    const candidate = mapDsbPersonToCandidate({
      ...person,
      birthyear: null,
      gender: null,
      fideId: undefined,
      rating: undefined,
      fideRatingStandard: undefined,
      fideCountry: undefined,
      fideTitle: undefined,
    });
    expect(candidateToFormValues(candidate, fallback)).toEqual({
      dsbPersonId: "NU4211295",
      dwzRating: undefined,
      fideRating: undefined,
      ...fallback,
    });
  });
});
