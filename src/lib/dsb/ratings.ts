import type { Participant } from "@/db/types/participant";
import type { DsbPerson } from "./types";

export const ELO_MISSING_AT_DSB_WARNING =
  "DSB liefert keine Standard-Elo – gespeicherte Elo prüfen";

export type StoredRatings = Pick<
  Participant,
  "dwzRating" | "fideRating" | "fideId"
>;

export type Change<T> = { previous: T | null; next: T };

export type DsbRatingDiff = {
  dwz: Change<number> | null;
  elo: Change<number> | null;
  fideId: Change<string> | null;
  eloMissingAtDsb: boolean;
};

export type DsbRatingOutcome = "updated" | "unchanged" | "withoutRating";

export function diffDsbRatings(
  stored: StoredRatings,
  person: DsbPerson,
): DsbRatingDiff {
  const dsb = toDsbRatings(person);
  return {
    dwz:
      dsb.dwzRating != null
        ? { previous: stored.dwzRating, next: dsb.dwzRating }
        : null,
    elo:
      dsb.fideRating != null
        ? { previous: stored.fideRating, next: dsb.fideRating }
        : null,
    fideId:
      dsb.fideId != null && dsb.fideId !== stored.fideId
        ? { previous: stored.fideId, next: dsb.fideId }
        : null,
    eloMissingAtDsb: dsb.fideRating == null && stored.fideRating != null,
  };
}

export function resolveFideData(
  stored: StoredRatings,
  person: DsbPerson | null,
): Pick<StoredRatings, "fideId" | "fideRating"> {
  const dsb = person != null ? toDsbRatings(person) : null;
  return {
    fideId: dsb?.fideId ?? stored.fideId,
    fideRating: dsb?.fideRating ?? stored.fideRating,
  };
}

export function toStoredRatingUpdate(
  diff: DsbRatingDiff,
): Partial<StoredRatings> {
  return {
    ...(diff.dwz && { dwzRating: diff.dwz.next }),
    ...(diff.elo && { fideRating: diff.elo.next }),
    ...(diff.fideId && { fideId: diff.fideId.next }),
  };
}

export function getRatingOutcome(diff: DsbRatingDiff): DsbRatingOutcome {
  const changes = [diff.dwz, diff.elo, diff.fideId].filter(
    (change) => change != null,
  );
  if (changes.length === 0) {
    return "withoutRating";
  }
  return changes.some((change) => change.previous !== change.next)
    ? "updated"
    : "unchanged";
}

function toDsbRatings(person: DsbPerson): StoredRatings {
  return {
    dwzRating: person.rating ?? null,
    fideRating: person.fideRatingStandard ?? null,
    fideId: person.fideId != null ? String(person.fideId) : null,
  };
}
