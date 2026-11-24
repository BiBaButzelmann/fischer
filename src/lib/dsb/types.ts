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

export type DsbPerson = {
  uuid: string;
  nuLigaPersonId: string;
  firstname: string;
  lastname: string;
  birthyear: number | null;
  gender: DsbGender | null;
  fideId: number | null;
  rating: number | null;
  index: number | null;
  memberships: DsbMembership[];
  weekOfLastTournamentEvaluation: string | null;
  fideRatingStandard?: number | null;
  fideCountry?: string | null;
  fideTitle?: string | null;
  fideWomenTitle?: string | null;
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
