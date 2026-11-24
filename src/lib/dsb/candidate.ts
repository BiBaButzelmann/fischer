import { isTitle, type Title } from "@/lib/title";
import type {
  DsbGender,
  DsbMembership,
  DsbPerson,
  DsbPlayerCandidate,
} from "./types";

const GENDERS: Record<DsbGender, DsbPlayerCandidate["gender"]> = {
  MALE: "m",
  FEMALE: "f",
};

export function transliterateGermanUmlauts(value: string): string {
  return value
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/Ä/g, "Ae")
    .replace(/Ö/g, "Oe")
    .replace(/Ü/g, "Ue")
    .replace(/ß/g, "ss");
}

export function selectPrimaryMembership(
  memberships: DsbMembership[],
): DsbMembership | null {
  const activeMembership = memberships.find(
    (membership) => membership.licenceState === "ACTIVE",
  );
  return activeMembership ?? memberships[0] ?? null;
}

export function mapDsbPersonToCandidate(person: DsbPerson): DsbPlayerCandidate {
  const primaryMembership = selectPrimaryMembership(person.memberships);
  return {
    nuLigaPersonId: person.nuLigaPersonId,
    firstName: person.firstname,
    lastName: person.lastname,
    birthYear: person.birthyear,
    dwzRating: person.rating ?? null,
    fideId: person.fideId != null ? String(person.fideId) : null,
    fideRating: person.fideRatingStandard ?? null,
    nationality: person.fideCountry ?? null,
    title: selectFideTitle(person),
    gender: GENDERS[person.gender],
    clubName: primaryMembership?.clubName ?? null,
  };
}

function selectFideTitle(person: DsbPerson): Title | null {
  return [person.fideTitle, person.fideWomenTitle].find(isTitle) ?? null;
}
