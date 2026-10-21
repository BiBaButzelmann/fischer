import invariant from "tiny-invariant";
import type { Game } from "@/db/types/game";
import type { Group } from "@/db/types/group";
import type { MatchDay } from "@/db/types/match-day";
import type { Profile } from "@/db/types/profile";
import { formatDateOnly } from "@/lib/date";
import type { GameViewFilters } from "@/lib/navigation";
import { getFullName } from "@/lib/participant";

type PgnFileNamePlayer = {
  profile: Pick<Profile, "firstName" | "lastName">;
};

export type PgnFileNameGame = Pick<
  Game,
  "whiteParticipantId" | "blackParticipantId"
> & {
  whiteParticipant: PgnFileNamePlayer | null;
  blackParticipant: PgnFileNamePlayer | null;
  group: Pick<Group, "groupName">;
  matchdayGame: { matchday: Pick<MatchDay, "date"> };
};

export function buildPgnFileName(
  tournamentName: string,
  { groupId, round, participantId, matchdayId }: GameViewFilters,
  games: PgnFileNameGame[],
): string {
  const [game] = games;
  const parts = [tournamentName];

  if (game && groupId && !participantId) {
    parts.push(game.group.groupName);
  }

  if (round) {
    parts.push(`Runde ${round}`);
  }

  if (game && matchdayId) {
    parts.push(
      formatDateOnly(game.matchdayGame.matchday.date).replace(/\./g, "_"),
    );
  }

  if (game && participantId) {
    const participant =
      game.whiteParticipantId === participantId
        ? game.whiteParticipant
        : game.blackParticipant;
    invariant(participant, "Game must have the selected participant");
    parts.push(
      getFullName(participant.profile.firstName, participant.profile.lastName),
    );
  }

  return `${parts.join("_").replace(/\s+/g, "_")}.pgn`;
}
