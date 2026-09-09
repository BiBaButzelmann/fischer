import {
  getCompletedGames,
  getParticipantsInGroup,
} from "@/db/repositories/game";
import type { Game } from "@/db/types/game";
import type { GroupSummary } from "@/db/types/group";
import type { Participant } from "@/db/types/participant";
import {
  getIndividualPlayerResult,
  isGameActuallyPlayed,
} from "@/lib/game-result-utils";
import { calculatePointsFromResult, calculateStandings } from "@/lib/standings";

type GroupParticipants = Awaited<ReturnType<typeof getParticipantsInGroup>>;
type GroupParticipant = GroupParticipants[number];

function filterGamesByWithdrawalRules(
  participants: Pick<Participant, "id" | "deletedAt">[],
  games: Game[],
): Game[] {
  const excludedParticipantIds = new Set(
    participants
      .filter((participant) => {
        if (participant.deletedAt == null) return false;

        const gamesPlayed = games.filter(
          (game) =>
            (game.whiteParticipantId === participant.id ||
              game.blackParticipantId === participant.id) &&
            !(
              (game.whiteParticipantId === participant.id &&
                (game.result === "-:+" || game.result === "-:-")) ||
              (game.blackParticipantId === participant.id &&
                (game.result === "+:-" || game.result === "-:-"))
            ),
        ).length;

        return gamesPlayed < (participants.length - 1) / 2;
      })
      .map((participant) => participant.id),
  );

  return games.filter(
    (game) =>
      !excludedParticipantIds.has(game.whiteParticipantId) &&
      !excludedParticipantIds.has(game.blackParticipantId),
  );
}

export async function getStandings(groupId: number, selectedRound?: number) {
  const [participants, completedGames] = await Promise.all([
    getParticipantsInGroup(groupId),
    getCompletedGames(groupId, selectedRound),
  ]);
  const games = filterGamesByWithdrawalRules(participants, completedGames);
  return calculateStandings(games, participants);
}

export function resolveStandingsParams(
  groups: GroupSummary[],
  selectedGroupId: string,
  selectedRound?: string,
): { groupId: number; round: number | undefined } {
  const parsedGroupId = Number(selectedGroupId);
  const groupId = Number.isNaN(parsedGroupId) ? groups[0].id : parsedGroupId;
  const parsedRound = Number(selectedRound);
  const round =
    selectedRound && Number.isFinite(parsedRound) && parsedRound > 0
      ? parsedRound
      : undefined;
  return { groupId, round };
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
  display: string;
  gameId: number;
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
  const [participants, completedGames] = await Promise.all([
    getParticipantsInGroup(groupId),
    getCompletedGames(groupId, selectedRound),
  ]);
  const games = filterGamesByWithdrawalRules(participants, completedGames);
  const standings = calculateStandings(games, participants);

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
    if (!result) {
      continue;
    }
    const played = isGameActuallyPlayed(result);
    addResult(whiteParticipantId, blackParticipantId, {
      points: calculatePointsFromResult(result, true),
      display: getIndividualPlayerResult(result, true),
      gameId: game.id,
      played,
    });
    addResult(blackParticipantId, whiteParticipantId, {
      points: calculatePointsFromResult(result, false),
      display: getIndividualPlayerResult(result, false),
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
