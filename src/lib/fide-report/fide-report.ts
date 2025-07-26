import { generatePlayerSection } from "./player-section";
import { generateTournamentSection } from "./tournament-section";
import { PlayerSectionData, TournamentSectionData } from "./types";

export function generateFideReport(
  tournamentSectionData: TournamentSectionData,
  playerSectionData: PlayerSectionData,
) {
  const tournamentSection = generateTournamentSection(
    tournamentSectionData,
    playerSectionData,
  );
  const playerSection = generatePlayerSection(playerSectionData);

  return `${tournamentSection}

${playerSection}`;
}
