/**
 * Builds a URL for navigating to the game view page with the specified parameters
 */
export function buildGameViewUrl(params: {
  tournamentId: number;
  groupId: number;
  round?: number;
  participantId?: number;
}): string {
  const searchParams = new URLSearchParams();
  searchParams.set("tournamentId", params.tournamentId.toString());
  searchParams.set("groupId", params.groupId.toString());

  params.round && searchParams.set("round", params.round.toString());
  params.participantId &&
    searchParams.set("participantId", params.participantId.toString());

  return `/partien?${searchParams.toString()}`;
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
