import {
  getCompletedGames,
  getParticipantsInGroup,
} from "@/db/repositories/game";
import { Game, GameResult, GameWithMatchday } from "@/db/types/game";
import { isGameActuallyPlayed } from "@/lib/game-auth";
import { didParticipantForfeitGame } from "@/lib/game";
import { getIndividualResultSymbol } from "@/lib/game-result-utils";
import { calculatePointsFromResult, calculateStandings } from "@/lib/standings";
import invariant from "tiny-invariant";

type GroupParticipants = Awaited<ReturnType<typeof getParticipantsInGroup>>;
type GroupParticipant = GroupParticipants[number];
type CompletedGames = Awaited<ReturnType<typeof getCompletedGames>>;

/**
 * The games that count towards the standings ("Wertung"). A game is excluded
 * ("annulled") when it involves an inactive (withdrawn) participant who played
 * less than 50% of their games — matching DWZ/FIDE handling of early
 * withdrawals. The cross-table uses the same set so its cells stay consistent
 * with the displayed points.
 */
function getRelevantGames(
  participants: GroupParticipants,
  games: CompletedGames,
): Set<Game> {
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

  return relevantGames;
}

export async function getStandings(groupId: number, selectedRound?: number) {
  const participants = await getParticipantsInGroup(groupId);
  const games = await getCompletedGames(groupId, selectedRound);
  return calculateStandings(
    Array.from(getRelevantGames(participants, games)),
    participants,
  );
}

export type CrossTableParticipant = {
  id: number;
  title: string | null;
  firstName: string;
  lastName: string;
  deletedAt: Date | null;
};

export type CrossTableResult = {
  points: number;
  result: GameResult;
  // Symbol shown in the cell from this player's perspective ("1" | "½" | "0"
  // for regular games, "+" | "−" for walkovers).
  display: string;
  // The game's id, so the cell can link to its Partie page.
  gameId: number;
  // Whether the game was actually played (has a viewable Partie). Walkovers
  // are not, so their cells are not linked.
  played: boolean;
};

export type CrossTableRow = {
  participant: CrossTableParticipant;
  position: number;
  points: number;
  sonnebornBerger: number;
  cells: (CrossTableResult[] | null)[];
};

export type CrossTable = {
  participants: CrossTableParticipant[];
  rows: CrossTableRow[];
};

function toCrossTableParticipant(
  participant: GroupParticipant,
): CrossTableParticipant {
  return {
    id: participant.id,
    title: participant.title,
    firstName: participant.profile.firstName,
    lastName: participant.profile.lastName,
    deletedAt: participant.deletedAt,
  };
}

export async function getCrossTable(
  groupId: number,
  selectedRound?: number,
): Promise<CrossTable> {
  const participants = await getParticipantsInGroup(groupId);
  const games = await getCompletedGames(groupId, selectedRound);
  const standings = await getStandings(groupId, selectedRound);
  const relevantGames = getRelevantGames(participants, games);

  const participantsById = new Map(participants.map((p) => [p.id, p]));
  const orderedParticipants = standings
    .map((s) => participantsById.get(s.participantId))
    .filter((p): p is GroupParticipant => p != null);

  const results = new Map<number, Map<number, CrossTableResult[]>>();
  for (const participant of participants) {
    results.set(participant.id, new Map());
  }

  const addResult = (
    playerId: number,
    opponentId: number,
    entry: CrossTableResult,
  ) => {
    const byOpponent = results.get(playerId);
    if (!byOpponent) return;
    const existing = byOpponent.get(opponentId) ?? [];
    existing.push(entry);
    byOpponent.set(opponentId, existing);
  };

  for (const game of games) {
    const { whiteParticipantId, blackParticipantId, result } = game;
    if (whiteParticipantId == null || blackParticipantId == null || !result) {
      continue;
    }
    // Annulled games don't count towards the standings, so keep them out of
    // the cross-table too (cells must agree with the points).
    if (!relevantGames.has(game)) {
      continue;
    }
    const played = isGameActuallyPlayed(result);
    addResult(whiteParticipantId, blackParticipantId, {
      points: calculatePointsFromResult(result, true),
      result,
      display: getIndividualResultSymbol(result, true),
      gameId: game.id,
      played,
    });
    addResult(blackParticipantId, whiteParticipantId, {
      points: calculatePointsFromResult(result, false),
      result,
      display: getIndividualResultSymbol(result, false),
      gameId: game.id,
      played,
    });
  }

  const statsByParticipant = new Map(
    standings.map((stats) => [stats.participantId, stats]),
  );

  const rows: CrossTableRow[] = orderedParticipants.map(
    (participant, index) => {
      const stats = statsByParticipant.get(participant.id);
      const cells = orderedParticipants.map((opponent) => {
        if (opponent.id === participant.id) {
          return null;
        }
        return results.get(participant.id)?.get(opponent.id) ?? [];
      });

      return {
        participant: toCrossTableParticipant(participant),
        position: index + 1,
        points: stats?.points ?? 0,
        sonnebornBerger: stats?.sonnebornBerger ?? 0,
        cells,
      };
    },
  );

  return {
    participants: orderedParticipants.map(toCrossTableParticipant),
    rows,
  };
}
