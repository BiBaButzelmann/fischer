import type { gameResults } from "@/db/schema/columns.helpers";

export type PlayerStanding = {
  participantId: number;
  name: string;
  title: string | null;
  dwz: number | null;
  elo: number | null;
  points: number;
  gamesPlayed: number;
  sonnebornBerger: number;
};

export type GameWithParticipants = {
  id: number;
  whiteParticipantId: number;
  blackParticipantId: number;
  result: (typeof gameResults)[number] | null;
  round: number;
  whiteParticipant: {
    id: number;
    dwzRating: number | null;
    fideRating: number | null;
    title: string | null;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  blackParticipant: {
    id: number;
    dwzRating: number | null;
    fideRating: number | null;
    title: string | null;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
};

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
      return 0; // Both forfeit
    default:
      return 0;
  }
}

export type ParticipantInGroup = {
  participant: {
    id: number;
    dwzRating: number | null;
    fideRating: number | null;
    title: string | null;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
};

export function calculateStandings(
  games: GameWithParticipants[],
  participants?: ParticipantInGroup[],
): PlayerStanding[] {
  const playerStats = new Map<number, PlayerStanding>();

  // First, initialize all participants from the participants list if provided
  if (participants) {
    participants.forEach((participantGroup) => {
      const participant = participantGroup.participant;
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

  // Then initialize any additional players from games (in case some aren't in participantGroup table)
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

  // Calculate points from games
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

  // Calculate Sonneborn-Berger scores
  // "Die Sonneborn-Berger-Zahl eines Spielers ist die Summe der vollen Punktzahl der Gegner,
  // gegen die er gewonnen hat, und der halben Punktzahl der Gegner, gegen die er unentschieden gespielt hat."
  games.forEach((game) => {
    if (!game.result) return;

    const whitePlayer = playerStats.get(game.whiteParticipantId)!;
    const blackPlayer = playerStats.get(game.blackParticipantId)!;

    const whitePoints = calculatePointsFromResult(game.result, true);
    const blackPoints = calculatePointsFromResult(game.result, false);

    // For white player: add opponent's total points based on result
    if (whitePoints === 1) {
      // White won: add full points of black opponent
      whitePlayer.sonnebornBerger += blackPlayer.points;
    } else if (whitePoints === 0.5) {
      // Draw: add half points of black opponent
      whitePlayer.sonnebornBerger += blackPlayer.points * 0.5;
    }
    // If white lost (0 points), add nothing

    // For black player: add opponent's total points based on result
    if (blackPoints === 1) {
      // Black won: add full points of white opponent
      blackPlayer.sonnebornBerger += whitePlayer.points;
    } else if (blackPoints === 0.5) {
      // Draw: add half points of white opponent
      blackPlayer.sonnebornBerger += whitePlayer.points * 0.5;
    }
    // If black lost (0 points), add nothing
  });

  // Convert to array and sort by points (descending), then by Sonneborn-Berger (descending), then by name
  return Array.from(playerStats.values()).sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    if (b.sonnebornBerger !== a.sonnebornBerger) {
      return b.sonnebornBerger - a.sonnebornBerger;
    }
    return a.name.localeCompare(b.name);
  });
}
