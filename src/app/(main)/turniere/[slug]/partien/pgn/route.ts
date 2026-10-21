import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/auth/utils";
import { getGamePgnsByTournamentId } from "@/db/repositories/game";
import { getRolesByUserIdAndTournamentId } from "@/db/repositories/role";
import { getTournamentBySlug } from "@/db/repositories/tournament";
import { canUserViewGames } from "@/lib/game-auth";
import { buildPgnFileName } from "@/lib/pgn/file-name";
import { buildPgnHeaders } from "@/lib/pgn/headers";
import { parsePgnMoves } from "@/lib/pgn/movetext";
import { toPgn } from "@/lib/pgn/pgn";

const filtersSchema = z.object({
  groupId: z.coerce.number().int().positive().optional(),
  round: z.coerce.number().int().positive().optional(),
  participantId: z.coerce.number().int().positive().optional(),
  matchdayId: z.coerce.number().int().positive().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await auth();
  if (!session) {
    return new Response(null, { status: 401 });
  }

  const { slug } = await params;
  const tournament = await getTournamentBySlug(slug);
  if (!tournament) {
    return new Response(null, { status: 404 });
  }

  const roles = await getRolesByUserIdAndTournamentId(
    session.user.id,
    tournament.id,
  );
  if (!canUserViewGames(roles)) {
    return new Response(null, { status: 403 });
  }

  const filters = filtersSchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!filters.success) {
    return new Response(null, { status: 400 });
  }

  const { groupId, round, participantId, matchdayId } = filters.data;
  const games = await getGamePgnsByTournamentId(
    tournament.id,
    groupId,
    matchdayId,
    round,
    participantId,
  );

  const content = games
    .flatMap((game) =>
      game.pgn?.value
        ? [
            toPgn(
              parsePgnMoves(game.pgn.value),
              buildPgnHeaders(game, tournament),
            ),
          ]
        : [],
    )
    .join("\n\n");
  const fileName = buildPgnFileName(tournament.name, filters.data, games);

  return new Response(content, {
    headers: {
      "Content-Type": "application/x-chess-pgn; charset=utf-8",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    },
  });
}
