import type { gameResults } from "@/db/schema/columns.helpers";
import type { PlayerStanding, PlayerStats } from "@/db/types/standings";
import type { ParticipantWithRating } from "@/db/types/participant";
import type { Game } from "@/db/types/game";
import invariant from "tiny-invariant";

function calculatePointsFromResult(
  result: (typeof gameResults)[number],
  isWhite: boolean,
): number {
  switch (result) {
    case "1:0":
      return isWhite ? 1 : 0;
    case "0:1":
      return isWhite ? 0 : 1;
    case "½-½":
      return 0.5;
    case "+:-":
      return isWhite ? 1 : 0;
    case "-:+":
      return isWhite ? 0 : 1;
    case "0-½":
      return isWhite ? 0 : 0.5;
    case "½-0":
      return isWhite ? 0.5 : 0;
    case "-:-":
      return 0;
    default:
      return 0;
  }
}

export function calculateStandings(
  games: Game[],
  participants: ParticipantWithRating[],
): PlayerStanding[] {
  const participantsMap = new Map<number, ParticipantWithRating>();
  participants.forEach((participant) => {
    participantsMap.set(participant.id, participant);
  });

  const playerStats = new Map<number, PlayerStats>();
  participants.forEach((participant) => {
    playerStats.set(participant.id, {
      participantId: participant.id,
      points: 0,
      gamesPlayed: 0,
      sonnebornBerger: 0,
    });
  });

  games.forEach((game) => {
    if (!game.result) return;

    const whitePlayer = playerStats.get(game.whiteParticipantId)!;
    const blackPlayer = playerStats.get(game.blackParticipantId)!;

    const whitePoints = calculatePointsFromResult(game.result, true);
    const blackPoints = calculatePointsFromResult(game.result, false);

    whitePlayer.points += whitePoints;
    blackPlayer.points += blackPoints;
    whitePlayer.gamesPlayed += 1;
    blackPlayer.gamesPlayed += 1;
  });

  games.forEach((game) => {
    if (!game.result) return;

    const whitePlayer = playerStats.get(game.whiteParticipantId)!;
    const blackPlayer = playerStats.get(game.blackParticipantId)!;

    const whitePoints = calculatePointsFromResult(game.result, true);
    const blackPoints = calculatePointsFromResult(game.result, false);

    if (whitePoints === 1) {
      whitePlayer.sonnebornBerger += blackPlayer.points;
    } else if (whitePoints === 0.5) {
      whitePlayer.sonnebornBerger += blackPlayer.points * 0.5;
    }

    if (blackPoints === 1) {
      blackPlayer.sonnebornBerger += whitePlayer.points;
    } else if (blackPoints === 0.5) {
      blackPlayer.sonnebornBerger += whitePlayer.points * 0.5;
    }
  });

  return Array.from(playerStats.values())
    .sort((a, b) => comparePlayerStats(a, b, participantsMap))
    .map((stats) => ({
      participant: participantsMap.get(stats.participantId)!,
      points: stats.points,
      gamesPlayed: stats.gamesPlayed,
      sonnebornBerger: stats.sonnebornBerger,
    }));
}

function comparePlayerStats(
  a: PlayerStats,
  b: PlayerStats,
  participantsMap: Map<number, ParticipantWithRating>,
): number {
  if (b.points !== a.points) {
    return b.points - a.points;
  }
  if (b.sonnebornBerger !== a.sonnebornBerger) {
    return b.sonnebornBerger - a.sonnebornBerger;
  }
  const participantA = participantsMap.get(a.participantId);
  const participantB = participantsMap.get(b.participantId);
  invariant(participantA && participantB);

  if ((participantB.dwzRating || 0) !== (participantA.dwzRating || 0)) {
    return (participantB.dwzRating || 0) - (participantA.dwzRating || 0);
  }
  if ((participantB.fideRating || 0) !== (participantA.fideRating || 0)) {
    return (participantB.fideRating || 0) - (participantA.fideRating || 0);
  }

  const fullNameA = `${participantA.profile.firstName} ${participantA.profile.lastName}`;
  const fullNameB = `${participantB.profile.firstName} ${participantB.profile.lastName}`;
  return fullNameA.localeCompare(fullNameB);
}
