export function tournamentPath(slug: string, subPath = ""): string {
  return `/turniere/${slug}${subPath}`;
}

export function buildGameViewParams(params: {
  groupId?: number;
  round?: number;
  participantId?: number;
  matchdayId?: number;
}) {
  const searchParams = new URLSearchParams();

  if (params.groupId) {
    searchParams.set("groupId", params.groupId.toString());
  }

  if (params.round) {
    searchParams.set("round", params.round.toString());
  }

  if (params.participantId) {
    searchParams.set("participantId", params.participantId.toString());
  }

  if (params.matchdayId) {
    searchParams.set("matchdayId", params.matchdayId.toString());
  }

  return searchParams;
}

export function buildGameViewUrl({
  slug,
  ...params
}: {
  slug: string;
  groupId?: number;
  round?: number;
  participantId?: number;
  matchdayId?: number;
}): string {
  const query = buildGameViewParams(params).toString();
  return tournamentPath(slug, query ? `/partien?${query}` : "/partien");
}

export function buildResultsViewUrl(params: {
  slug: string;
  groupId?: string;
  round?: string;
  basePath?: string;
}): string {
  const searchParams = new URLSearchParams();

  if (params.groupId) {
    searchParams.set("groupId", params.groupId);
  }
  if (params.round) {
    searchParams.set("round", params.round);
  }

  const query = searchParams.toString();
  const basePath = params.basePath ?? "/rangliste";
  return tournamentPath(params.slug, query ? `${basePath}?${query}` : basePath);
}
