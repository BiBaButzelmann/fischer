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
  uuid: string;
  nuLigaPersonId: string;
  firstname: string;
  lastname: string;
  birthyear: number | null;
  gender: DsbGender | null;
  fideId?: number;
  rating?: number;
  index?: number;
  memberships: DsbMembership[];
  weekOfLastTournamentEvaluation?: string;
  fideRatingStandard?: number;
  fideCountry?: string;
  fideTitle?: string;
  fideWomenTitle?: string;
};

export type DsbPlayerCandidate = {
  nuLigaPersonId: string;
  firstName: string;
  lastName: string;
  birthYear: number | null;
  dwzRating: number | null;
  fideId: string | null;
  fideRating: number | null;
  nationality: string | null;
  title: Title | null;
  gender: "m" | "f" | null;
  clubName: string | null;
};
