import { getParticipantsByGroupId } from "@/db/repositories/participant";
import { Game } from "@/db/types/game";
import { buildGameViewUrl } from "@/lib/navigation";
import { getParticipantFullName } from "@/lib/participant";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import invariant from "tiny-invariant";

type Props = {
  tournamentId: number;
  groupId: number;
  games: Game[];
};

export async function UncompletedGames({
  tournamentId,
  groupId,
  games,
}: Props) {
  if (games.length === 0) {
    return null;
  }

  const participants = await getParticipantsByGroupId(games[0].groupId);
  return (
    <div className="px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
      <span className="font-semibold tracking-tight">
        Partien ohne Ergebnis
      </span>
      <div className="flex flex-col gap-1 mt-2">
        {games.map((g) => {
          const whiteParticipant = participants.find(
            (p) => p.id === g.whiteParticipantId,
          );
          const blackParticipant = participants.find(
            (p) => p.id === g.blackParticipantId,
          );
          invariant(whiteParticipant != null && blackParticipant != null);

          return (
            <Link
              key={g.id}
              href={buildGameViewUrl({ tournamentId, groupId })}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center border border-gray-200 py-2 rounded-sm px-2"
            >
              <div className="text-center text-sm flex-1">
                {getParticipantFullName(whiteParticipant!)} vs{" "}
                {getParticipantFullName(blackParticipant!)}
              </div>
              <ExternalLink size={14} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
