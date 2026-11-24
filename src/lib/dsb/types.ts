import type { Title } from "@/lib/title";

export type DsbMembership = {
  vkz: string;
  memberNo: string;
  clubName: string;
  licenceState: string;
  regionName: string;
  federationName: string;
};

export type DsbGender = "MALE" | "FEMALE";

// The Wertungsportal omits absent values instead of sending null.
export type DsbPerson = {
  nuLigaPersonId: string;
  firstname: string;
  lastname: string;
  birthyear: number;
  gender: DsbGender;
  fideId?: number;
  rating?: number;
  memberships: DsbMembership[];
  fideRatingStandard?: number;
  fideCountry?: string;
  fideTitle?: string;
  fideWomenTitle?: string;
};

export type DsbPlayerCandidate = {
  nuLigaPersonId: string;
  firstName: string;
  lastName: string;
  birthYear: number;
  dwzRating: number | null;
  fideId: string | null;
  fideRating: number | null;
  nationality: string | null;
  title: Title | null;
  gender: "m" | "f";
  clubName: string | null;
};
