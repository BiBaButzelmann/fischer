export function tournamentPath(slug: string, subPath = ""): string {
  return `/turniere/${slug}${subPath}`;
}

export type GameViewFilters = {
  groupId?: number;
  round?: number;
  participantId?: number;
  matchdayId?: number;
};

function buildGameViewParams(params: GameViewFilters) {
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

export function buildGameViewUrl(
  { slug, ...params }: { slug: string } & GameViewFilters,
  subPath = "",
): string {
  const query = buildGameViewParams(params).toString();
  const path = `/partien${subPath}`;
  return tournamentPath(slug, query ? `${path}?${query}` : path);
}

export type StandingsView = "tabelle" | "kreuztabelle";

export function buildResultsViewUrl(params: {
  slug: string;
  groupId?: string;
  round?: string;
  view?: StandingsView;
}): string {
  const searchParams = new URLSearchParams();

  if (params.groupId) {
    searchParams.set("groupId", params.groupId);
  }
  if (params.round) {
    searchParams.set("round", params.round);
  }
  if (params.view && params.view !== "tabelle") {
    searchParams.set("view", params.view);
  }

  const query = searchParams.toString();
  return tournamentPath(params.slug, query ? `/tabelle?${query}` : "/tabelle");
}
