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
};

export type DsbPlayerCandidate = {
  nuLigaPersonId: string;
  firstName: string;
  lastName: string;
  birthYear: number | null;
  dwzRating: number | null;
  fideId: string | null;
  gender: "m" | "f" | null;
  clubName: string | null;
};
