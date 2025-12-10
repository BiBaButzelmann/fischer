import type { Game, GameWithMatchday } from "@/db/types/game";
import type { ParticipantWithName } from "@/db/types/participant";
import { didParticipantForfeitGame } from "@/lib/game";
import invariant from "tiny-invariant";

export function filterRelevantGames(
  games: GameWithMatchday[],
  participants: ParticipantWithName[],
): Game[] {
  const participantsMap = Object.fromEntries(
    participants.map((p) => [p.id, p]),
  );

  const gamesPlayedPerParticipant = games.reduce(
    (acc, game) => {
      const { whiteParticipantId, blackParticipantId } = game;

      if (whiteParticipantId == null || blackParticipantId == null) {
        return acc;
      }

      const whiteParticipant = participantsMap[whiteParticipantId];
      const blackParticipant = participantsMap[blackParticipantId];

      // consider a game not played for deleted participants based on the result
      if (
        whiteParticipant.deletedAt == null ||
        !didParticipantForfeitGame(whiteParticipantId, game)
      ) {
        if (!acc[whiteParticipantId]) {
          acc[whiteParticipantId] = [];
        }
        acc[whiteParticipantId].push(game);
      }
      if (
        blackParticipant.deletedAt == null ||
        !didParticipantForfeitGame(blackParticipantId, game)
      ) {
        if (!acc[blackParticipantId]) {
          acc[blackParticipantId] = [];
        }
        acc[blackParticipantId].push(game);
      }

      return acc;
    },
    {} as Record<number, GameWithMatchday[]>,
  );

  const activeParticipants = new Set(
    participants.filter((p) => p.deletedAt == null).map((p) => p.id),
  );
  const inactiveParticipants = new Set(
    participants.filter((p) => p.deletedAt != null).map((p) => p.id),
  );

  const totalGamesToPlay = participants.length - 1;
  const relevantGames: Set<Game> = new Set();

  // add all games to list except if one of the participants is inactive and has played less than 50% of their games
  for (const game of games) {
    const { whiteParticipantId, blackParticipantId } = game;
    invariant(
      whiteParticipantId != null && blackParticipantId != null,
      "Both participants must be defined",
    );

    if (
      activeParticipants.has(whiteParticipantId) &&
      activeParticipants.has(blackParticipantId)
    ) {
      relevantGames.add(game);
      continue;
    }

    let isRelevant = true;
    if (inactiveParticipants.has(whiteParticipantId)) {
      const gamesPlayed = gamesPlayedPerParticipant[whiteParticipantId] || [];
      const gamesPlayedCount = gamesPlayed.length;
      if (gamesPlayedCount / totalGamesToPlay < 0.5) {
        isRelevant = false;
      }
    }
    if (inactiveParticipants.has(blackParticipantId)) {
      const gamesPlayed = gamesPlayedPerParticipant[blackParticipantId] || [];
      const gamesPlayedCount = gamesPlayed.length;
      if (gamesPlayedCount / totalGamesToPlay < 0.5) {
        isRelevant = false;
      }
    }

    if (isRelevant) {
      relevantGames.add(game);
    }
  }

  return Array.from(relevantGames);
}
