import { Chess, Move } from "chess.js";
import invariant from "tiny-invariant";
import { GameWithParticipantsAndPGNAndDate } from "@/db/types/game";
import { getParticipantFullName } from "@/lib/participant";
import { getGameTimeFromGame } from "@/lib/game-time";
import { toDateString } from "@/lib/date";

//TODO: cleanup db entries, all results shall be stored with a "-"
function normalizeResult(result: string): string {
  const trimmed = result.trim();
  return trimmed.includes(":") ? trimmed.replace(/:/g, "-") : trimmed;
}

export function getHeadersFromGame(
  game: GameWithParticipantsAndPGNAndDate,
): Record<string, string> {
  invariant(game.whiteParticipant, "Game must have white participant");
  invariant(game.blackParticipant, "Game must have black participant");
  invariant(game.result, "Game must have result");

  return {
    Event: game.tournament.name,
    Site: "https://klubturnier.hsk1830.de",
    Date: toDateString(
      getGameTimeFromGame(game, game.tournament.gameStartTime),
    ),
    Round: game.round.toString(),
    White: getParticipantFullName(game.whiteParticipant),
    Black: getParticipantFullName(game.blackParticipant),
    Result: normalizeResult(game.result),
  };
}

export function computePGNFromMoves(
  moves: Move[],
  headers?: Record<string, string>,
): string {
  const chess = new Chess();

  if (headers) {
    for (const [key, value] of Object.entries(headers)) {
      if (value) {
        chess.setHeader(key, value);
      }
    }
  }

  for (const move of moves) {
    chess.move(move);
  }
  return chess.pgn();
}
