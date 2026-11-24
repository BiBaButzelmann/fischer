import type z from "zod";
import type { participantFormSchema } from "@/schema/participant";
import { isTitle, type Title } from "@/lib/title";
import type {
  DsbGender,
  DsbMembership,
  DsbPerson,
  DsbPlayerCandidate,
} from "./types";

type ParticipantFormValues = z.infer<typeof participantFormSchema>;

type PersonFormFields = Pick<
  ParticipantFormValues,
  "fideId" | "title" | "gender" | "nationality" | "birthYear"
>;

type DsbFormFields = PersonFormFields &
  Pick<ParticipantFormValues, "dsbPersonId" | "dwzRating" | "fideRating">;

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
    dwzRating: person.rating ?? null,
    fideId: person.fideId != null ? String(person.fideId) : null,
    fideRating: person.fideRatingStandard ?? null,
    nationality: person.fideCountry ?? null,
    title: selectFideTitle(person),
    gender: mapDsbGender(person.gender),
    clubName: primaryMembership?.clubName ?? null,
  };
}

export function candidateToFormValues(
  candidate: DsbPlayerCandidate,
  fallback: PersonFormFields,
): DsbFormFields {
  return {
    dsbPersonId: candidate.nuLigaPersonId,
    dwzRating: candidate.dwzRating ?? undefined,
    fideRating: candidate.fideRating ?? undefined,
    fideId: candidate.fideId ?? fallback.fideId,
    title: candidate.title ?? fallback.title,
    gender: candidate.gender ?? fallback.gender,
    nationality: candidate.nationality ?? fallback.nationality,
    birthYear: candidate.birthYear ?? fallback.birthYear,
  };
}

function selectFideTitle(person: DsbPerson): Title | null {
  return [person.fideTitle, person.fideWomenTitle].find(isTitle) ?? null;
}
