import invariant from "tiny-invariant";
import type { GameResult } from "@/db/types/game";
import type { Participant } from "@/db/types/participant";
import type { Profile } from "@/db/types/profile";
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

type PgnPlayer = Pick<Participant, "title" | "fideRating" | "fideId"> & {
  profile: Pick<Profile, "firstName" | "lastName">;
};

export type PgnGame = {
  round: number;
  result: GameResult | null;
  whiteParticipant: PgnPlayer | null;
  blackParticipant: PgnPlayer | null;
  group: { groupName: string };
  matchdayGame: { matchday: { date: string } };
};

const PGN_EVENT_PREFIX = "HSK";
const PGN_SITE = "Hamburg GER";

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
  tournamentName: string,
): PgnHeaders {
  const { whiteParticipant: white, blackParticipant: black } = game;
  invariant(white, "Game must have white participant");
  invariant(black, "Game must have black participant");
  invariant(game.result, "Game must have result");

  return {
    Event: `${PGN_EVENT_PREFIX} ${tournamentName} Gruppe ${game.group.groupName}`,
    Site: PGN_SITE,
    Date: toPgnDate(game.matchdayGame.matchday.date),
    Round: game.round.toString(),
    White: toPgnPlayerName(white.profile),
    Black: toPgnPlayerName(black.profile),
    Result: PGN_RESULT[game.result],
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
