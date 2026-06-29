import { ParticipantWithName } from "@/db/types/participant";

type RatingFields = { fideRating: number | null; dwzRating: number | null };

/**
 * Turnierwertungszahl (TWZ) = höhere Wertungszahl aus ELO (FIDE) und DWZ.
 * Existiert nur eine Wertung, ist das die TWZ. Existiert keine, ist die TWZ
 * undefiniert (null) – die Turnierleitung teilt solche Spieler manuell ein.
 */
export function getTwz({ fideRating, dwzRating }: RatingFields): number | null {
  const values = [fideRating, dwzRating].filter((v): v is number => v != null);
  return values.length ? Math.max(...values) : null;
}

/**
 * Die zweite (niedrigere) Wertung – nur wenn beide vorhanden, sonst null.
 * Wird als Tie-Break bei gleicher TWZ genutzt.
 */
function getSecondaryRating({ fideRating, dwzRating }: RatingFields): number | null {
  return fideRating != null && dwzRating != null
    ? Math.min(fideRating, dwzRating)
    : null;
}

/** Anzeigewert der TWZ mit Platzhalter (Default "-"), wenn keine Wertung vorliegt. */
export function formatTwz(participant: RatingFields, fallback = "-"): string {
  const twz = getTwz(participant);
  return twz === null ? fallback : String(twz);
}

/**
 * Durchschnittliche TWZ der bewerteten Teilnehmer. Gibt null zurück, wenn kein
 * Teilnehmer eine Wertung hat (Aufrufer wählt den passenden Platzhalter).
 */
export function averageTwz(participants: RatingFields[]): number | null {
  const ratings = participants
    .map((participant) => getTwz(participant))
    .filter((twz): twz is number => twz !== null);
  if (ratings.length === 0) return null;
  return ratings.reduce((sum, twz) => sum + twz, 0) / ratings.length;
}

/**
 * Sortiert Teilnehmer absteigend nach TWZ. Tie-Break bei gleicher TWZ:
 * 1. zweite (niedrigere) Wertung absteigend (Spieler mit nur einer Wertung zuletzt),
 * 2. Nachname alphabetisch.
 * Spieler ganz ohne Wertung landen am Ende.
 */
export function sortParticipantsByTwz(
  participants: ParticipantWithName[],
): ParticipantWithName[] {
  const orMissing = (value: number | null) =>
    value === null ? -Infinity : value;

  return [...participants].sort((a, b) => {
    const byTwz = orMissing(getTwz(b)) - orMissing(getTwz(a));
    if (byTwz !== 0) return byTwz;

    const bySecondary =
      orMissing(getSecondaryRating(b)) - orMissing(getSecondaryRating(a));
    if (bySecondary !== 0) return bySecondary;

    return a.profile.lastName.localeCompare(b.profile.lastName);
  });
}
