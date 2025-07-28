import type { gameResults } from "@/db/schema/columns.helpers";
import type {
  PlayerStanding,
  ParticipantWithRating,
  GameWithParticipants,
} from "@/db/types/standings";

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
  games: GameWithParticipants[],
  participants?: ParticipantWithRating[],
): PlayerStanding[] {
  const playerStats = new Map<number, PlayerStanding>();

  if (participants) {
    participants.forEach((participant) => {
      playerStats.set(participant.id, {
        participantId: participant.id,
        name: `${participant.profile.firstName} ${participant.profile.lastName}`,
        title: participant.title,
        dwz: participant.dwzRating,
        elo: participant.fideRating,
        points: 0,
        gamesPlayed: 0,
        sonnebornBerger: 0,
      });
    });
  }

  games.forEach((game) => {
    if (!playerStats.has(game.whiteParticipantId)) {
      playerStats.set(game.whiteParticipantId, {
        participantId: game.whiteParticipantId,
        name: `${game.whiteParticipant.profile.firstName} ${game.whiteParticipant.profile.lastName}`,
        title: game.whiteParticipant.title,
        dwz: game.whiteParticipant.dwzRating,
        elo: game.whiteParticipant.fideRating,
        points: 0,
        gamesPlayed: 0,
        sonnebornBerger: 0,
      });
    }

    if (!playerStats.has(game.blackParticipantId)) {
      playerStats.set(game.blackParticipantId, {
        participantId: game.blackParticipantId,
        name: `${game.blackParticipant.profile.firstName} ${game.blackParticipant.profile.lastName}`,
        title: game.blackParticipant.title,
        dwz: game.blackParticipant.dwzRating,
        elo: game.blackParticipant.fideRating,
        points: 0,
        gamesPlayed: 0,
        sonnebornBerger: 0,
      });
    }
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

  return Array.from(playerStats.values()).sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    if (b.sonnebornBerger !== a.sonnebornBerger) {
      return b.sonnebornBerger - a.sonnebornBerger;
    }
    if ((b.dwz || 0) !== (a.dwz || 0)) {
      return (b.dwz || 0) - (a.dwz || 0);
    }
    if ((b.elo || 0) !== (a.elo || 0)) {
      return (b.elo || 0) - (a.elo || 0);
    }
    return a.name.localeCompare(b.name);
  });
}
