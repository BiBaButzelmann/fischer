import type {
  DsbGender,
  DsbMembership,
  DsbPerson,
  DsbPlayerCandidate,
} from "./types";

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

export function mapDsbGender(gender: DsbGender | null): "m" | "f" | null {
  if (gender === "MALE") {
    return "m";
  }
  if (gender === "FEMALE") {
    return "f";
  }
  return null;
}

export function mapDsbPersonToCandidate(person: DsbPerson): DsbPlayerCandidate {
  const primaryMembership = selectPrimaryMembership(person.memberships);
  return {
    nuLigaPersonId: person.nuLigaPersonId,
    firstName: person.firstname,
    lastName: person.lastname,
    birthYear: person.birthyear,
    dwzRating: person.rating,
    fideId: person.fideId != null ? String(person.fideId) : null,
    gender: mapDsbGender(person.gender),
    clubName: primaryMembership?.clubName ?? null,
  };
}
