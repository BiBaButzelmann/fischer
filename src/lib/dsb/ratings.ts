import type { Participant } from "@/db/types/participant";

export const ELO_MISSING_AT_DSB_WARNING =
  "DSB liefert keine Standard-Elo – gespeicherte Elo prüfen";

const RATING_KEYS = ["dwzRating", "fideRating", "fideId"] as const;

export type Ratings = Pick<Participant, (typeof RATING_KEYS)[number]>;

export type RatingSync = { previous: Ratings; dsb: Ratings };

export type RatingSyncOutcome = "updated" | "unchanged" | "withoutRating";

export type FideData = Pick<
  Participant,
  "fideId" | "fideRating" | "nationality" | "title" | "birthYear" | "gender"
>;

export function pickRatings({
  dwzRating,
  fideRating,
  fideId,
}: Ratings): Ratings {
  return { dwzRating, fideRating, fideId };
}

export function mergeDsbRatings({ previous, dsb }: RatingSync): Ratings {
  return {
    dwzRating: dsb.dwzRating ?? previous.dwzRating,
    fideRating: dsb.fideRating ?? previous.fideRating,
    fideId: dsb.fideId ?? previous.fideId,
  };
}

export function getRatingSyncOutcome({
  previous,
  dsb,
}: RatingSync): RatingSyncOutcome {
  if (
    RATING_KEYS.some((key) => dsb[key] != null && dsb[key] !== previous[key])
  ) {
    return "updated";
  }
  return dsb.dwzRating == null && dsb.fideRating == null
    ? "withoutRating"
    : "unchanged";
}

export function isEloMissingAtDsb({ previous, dsb }: RatingSync): boolean {
  return dsb.fideRating == null && previous.fideRating != null;
}

export function resolveFideData(stored: FideData, dsb: FideData): FideData {
  return {
    fideId: dsb.fideId ?? stored.fideId,
    fideRating: dsb.fideRating ?? stored.fideRating,
    nationality: dsb.nationality ?? stored.nationality,
    title: dsb.title ?? stored.title,
    birthYear: dsb.birthYear ?? stored.birthYear,
    gender: dsb.gender ?? stored.gender,
  };
}
