import invariant from "tiny-invariant";
import type { GameResult } from "@/db/types/game";
import type { Group } from "@/db/types/group";
import type { MatchDay } from "@/db/types/match-day";
import type { Participant } from "@/db/types/participant";
import type { Profile } from "@/db/types/profile";
import type { Tournament } from "@/db/types/tournament";
import { CLUB_FEDERATION } from "@/constants/constants";
import { toPgnDate } from "@/lib/date";
import { toFideSpelling } from "@/lib/fide/spelling";

export type PgnResult = "1-0" | "0-1" | "1/2-1/2" | "*";

export type PgnHeaders = {
  Event: string;
  Site: string;
  Date: string;
  Round: string;
  White: string;
  Black: string;
  Result: PgnResult;
  WhiteTitle?: string;
  BlackTitle?: string;
  WhiteElo?: string;
  BlackElo?: string;
  WhiteFideId?: string;
  BlackFideId?: string;
};

export type PgnPlayer = Pick<Participant, "title" | "fideRating" | "fideId"> & {
  profile: Pick<Profile, "firstName" | "lastName">;
};

export type PgnGame = {
  round: number;
  result: GameResult | null;
  whiteParticipant: PgnPlayer | null;
  blackParticipant: PgnPlayer | null;
  group: Pick<Group, "groupName">;
  matchdayGame: { matchday: Pick<MatchDay, "date"> };
};

export type PgnTournament = Pick<Tournament, "name" | "location">;

const PGN_EVENT_PREFIX = "HSK";

const PGN_RESULT = {
  "1:0": "1-0",
  "0:1": "0-1",
  "½-½": "1/2-1/2",
  "+:-": "1-0",
  "-:+": "0-1",
  "-:-": "*",
  "0-½": "*",
  "½-0": "*",
} as const satisfies Record<GameResult, PgnResult>;

export function buildPgnHeaders(
  game: PgnGame,
  tournament: PgnTournament,
): PgnHeaders {
  const { whiteParticipant: white, blackParticipant: black } = game;
  invariant(white, "Game must have white participant");
  invariant(black, "Game must have black participant");

  return {
    Event: `${PGN_EVENT_PREFIX} ${tournament.name} Gruppe ${game.group.groupName}`,
    Site: `${tournament.location} ${CLUB_FEDERATION}`,
    Date: toPgnDate(game.matchdayGame.matchday.date),
    Round: game.round.toString(),
    White: toPgnPlayerName(white.profile),
    Black: toPgnPlayerName(black.profile),
    Result: game.result ? PGN_RESULT[game.result] : "*",
    WhiteTitle: white.title ?? undefined,
    BlackTitle: black.title ?? undefined,
    WhiteElo: toElo(white.fideRating),
    BlackElo: toElo(black.fideRating),
    WhiteFideId: toFideId(white.fideId),
    BlackFideId: toFideId(black.fideId),
  };
}

function toElo(fideRating: number | null): string | undefined {
  return fideRating ? fideRating.toString() : undefined;
}

function toFideId(fideId: string | null): string | undefined {
  const id = fideId?.trim();
  return id && /^\d+$/.test(id) ? id : undefined;
}

function toPgnPlayerName({
  firstName,
  lastName,
}: PgnPlayer["profile"]): string {
  return `${toPgnNamePart(lastName)}, ${toPgnNamePart(firstName)}`;
}

function toPgnNamePart(name: string): string {
  return toFideSpelling(name.trim().replace(/\s+/g, " "));
}
