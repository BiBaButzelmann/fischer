import { ParticipantWithName } from "@/db/types/participant";

export function sortParticipantsByElo(
  participants: ParticipantWithName[],
): ParticipantWithName[] {
  return [...participants].sort((a, b) => {
    if (a.fideRating !== null && b.fideRating !== null) {
      if (a.fideRating !== b.fideRating) {
        return b.fideRating - a.fideRating;
      }
    } else if (a.fideRating !== null && b.fideRating === null) {
      return -1;
    } else if (a.fideRating === null && b.fideRating !== null) {
      return 1;
    }

    if (a.dwzRating !== null && b.dwzRating !== null) {
      if (a.dwzRating !== b.dwzRating) {
        return b.dwzRating - a.dwzRating;
      }
    } else if (a.dwzRating !== null && b.dwzRating === null) {
      return -1;
    } else if (a.dwzRating === null && b.dwzRating !== null) {
      return 1;
    }

    return a.profile.lastName.localeCompare(b.profile.lastName);
  });
}

export function sortParticipantsByDwz(
  participants: ParticipantWithName[],
): ParticipantWithName[] {
  return [...participants].sort((a, b) => {
    if (a.dwzRating !== null && b.dwzRating !== null) {
      if (a.dwzRating !== b.dwzRating) {
        return b.dwzRating - a.dwzRating;
      }
    } else if (a.dwzRating !== null && b.dwzRating === null) {
      return -1;
    } else if (a.dwzRating === null && b.dwzRating !== null) {
      return 1;
    }

    return a.profile.lastName.localeCompare(b.profile.lastName);
  });
}
