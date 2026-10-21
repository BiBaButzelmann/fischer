import type { Move } from "chess.js";
import type { PgnHeaders } from "./headers";
import { toMovetext } from "./movetext";

export function toPgn(moves: Pick<Move, "san">[], headers: PgnHeaders): string {
  const tagPairs = Object.entries(headers).flatMap(([key, value]) =>
    value ? [`[${key} "${escapeTagValue(value)}"]`] : [],
  );
  const movetext = [toMovetext(moves), headers.Result]
    .filter(Boolean)
    .join(" ");
  return `${tagPairs.join("\n")}\n\n${movetext}`;
}

function escapeTagValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
