import type { DsbPlayerCandidate } from "@/lib/dsb/types";
import type { ParticipantFormValues } from "@/schema/participant";

type DsbFormValues = Pick<
  ParticipantFormValues,
  | "dsbPersonId"
  | "dwzRating"
  | "fideRating"
  | "gender"
  | "birthYear"
  | "fideId"
  | "title"
  | "nationality"
>;

export function candidateToFormValues(
  candidate: DsbPlayerCandidate,
  current: Pick<ParticipantFormValues, "fideId" | "title" | "nationality">,
): DsbFormValues {
  return {
    dsbPersonId: candidate.nuLigaPersonId,
    dwzRating: candidate.dwzRating ?? undefined,
    fideRating: candidate.fideRating ?? undefined,
    gender: candidate.gender,
    birthYear: candidate.birthYear,
    fideId: candidate.fideId ?? current.fideId,
    title: candidate.title ?? current.title,
    nationality: candidate.nationality ?? current.nationality,
  };
}
