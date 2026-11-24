import type { DsbPerson } from "./types";

export type Change<T> = { previous: T | null; next: T };

export type StoredRatings = {
  dwzRating: number | null;
  fideRating: number | null;
  fideId: string | null;
};

export type DsbRatingDiff = {
  dwz: Change<number> | null;
  elo: Change<number> | null;
  fideId: Change<string> | null;
  eloMissingAtDsb: boolean;
};

export function diffDsbRatings(
  stored: StoredRatings,
  person: DsbPerson,
): DsbRatingDiff {
  const dsbFideId = person.fideId != null ? String(person.fideId) : null;
  const dsbElo = person.fideRatingStandard ?? null;
  return {
    dwz:
      person.rating != null
        ? { previous: stored.dwzRating, next: person.rating }
        : null,
    elo: dsbElo != null ? { previous: stored.fideRating, next: dsbElo } : null,
    fideId:
      dsbFideId != null && dsbFideId !== stored.fideId
        ? { previous: stored.fideId, next: dsbFideId }
        : null,
    eloMissingAtDsb: dsbElo == null && stored.fideRating != null,
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

export function hasRatingData(diff: DsbRatingDiff): boolean {
  return diff.dwz != null || diff.elo != null || diff.fideId != null;
}

export function currentFideData(
  stored: StoredRatings,
  diff: DsbRatingDiff | null,
): { fideId: string | null; fideRating: number | null } {
  return {
    fideId: diff?.fideId?.next ?? stored.fideId,
    fideRating: diff?.elo?.next ?? stored.fideRating,
  };
}
