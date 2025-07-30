/**
 * Builds a URL for navigating to the game view page with the specified parameters
 */
export function buildGameViewUrl(params: {
  tournamentId: number;
  groupId: number;
  round: number;
  participantId: number;
}): string {
  const url = new URL("/partien", window.location.origin);
  url.searchParams.set("tournamentId", params.tournamentId.toString());
  url.searchParams.set("groupId", params.groupId.toString());
  url.searchParams.set("round", params.round.toString());
  url.searchParams.set("participantId", params.participantId.toString());

  return url.toString();
}

/**
 * Builds query parameters for partien/results pages
 */
export function buildPartienQueryParams(params: {
  tournamentId: string;
  groupId: string;
  round?: string;
  participantId?: string;
}): string {
  const searchParams = new URLSearchParams();
  searchParams.set("tournamentId", params.tournamentId);
  searchParams.set("groupId", params.groupId);

  if (params.round != null && params.round !== "") {
    searchParams.set("round", params.round);
  }

  if (params.participantId != null && params.participantId !== "") {
    searchParams.set("participantId", params.participantId);
  }

  return `?${searchParams.toString()}`;
}

/**
 * Builds URL for results page with query parameters
 */
export function buildResultsUrl(params: {
  tournamentId: string;
  groupId?: string;
  round?: string;
}): string {
  const searchParams = new URLSearchParams();
  searchParams.set("tournamentId", params.tournamentId);

  if (params.groupId) {
    searchParams.set("groupId", params.groupId);
  }

  if (params.round) {
    searchParams.set("round", params.round);
  }

  return `/ergebnisse?${searchParams.toString()}`;
}
