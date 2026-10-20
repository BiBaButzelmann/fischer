import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/auth/utils";
import { getGamesByTournamentId } from "@/db/repositories/game";
import { getGroupById } from "@/db/repositories/group";
import { getMatchdayById } from "@/db/repositories/match-day";
import { getParticipantsByGroupId } from "@/db/repositories/participant";
import { getRolesByUserIdAndTournamentId } from "@/db/repositories/role";
import { getTournamentBySlug } from "@/db/repositories/tournament";
import { formatDateOnly } from "@/lib/date";
import { canUserViewGames } from "@/lib/game-auth";
import { getFullName } from "@/lib/participant";
import { buildPgnHeaders } from "@/lib/pgn/headers";
import { parsePgnMoves, toPgn } from "@/lib/pgn/movetext";

const filtersSchema = z.object({
  groupId: z.coerce.number().int().positive().optional(),
  round: z.coerce.number().int().positive().optional(),
  participantId: z.coerce.number().int().positive().optional(),
  matchdayId: z.coerce.number().int().positive().optional(),
});

type PgnExportFilters = z.infer<typeof filtersSchema>;

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
  const [games, fileName] = await Promise.all([
    getGamesByTournamentId(
      tournament.id,
      groupId,
      matchdayId,
      round,
      participantId,
    ),
    buildPgnFileName(tournament.name, filters.data),
  ]);

  const content = games
    .flatMap((game) =>
      game.pgn
        ? [
            toPgn(
              parsePgnMoves(game.pgn.value),
              buildPgnHeaders(game, tournament.name),
            ),
          ]
        : [],
    )
    .join("\n\n");

  return new Response(content, {
    headers: {
      "Content-Type": "application/x-chess-pgn; charset=utf-8",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    },
  });
}

async function buildPgnFileName(
  tournamentName: string,
  { groupId, round, participantId, matchdayId }: PgnExportFilters,
) {
  const parts = [tournamentName];

  if (groupId && !participantId) {
    const group = await getGroupById(groupId);
    if (group) {
      parts.push(group.groupName);
    }
  }

  if (round) {
    parts.push(`Runde ${round}`);
  }

  if (matchdayId) {
    const matchday = await getMatchdayById(matchdayId);
    if (matchday) {
      parts.push(formatDateOnly(matchday.date).replace(/\./g, "_"));
    }
  }

  if (participantId && groupId) {
    const participants = await getParticipantsByGroupId(groupId);
    const participant = participants.find((p) => p.id === participantId);
    if (participant) {
      parts.push(
        getFullName(participant.profile.firstName, participant.profile.lastName),
      );
    }
  }

  return `${parts.join("_").replace(/\s+/g, "_")}.pgn`;
}
