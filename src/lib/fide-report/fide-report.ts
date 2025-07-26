import { generatePlayerSection } from "./player-section";
import { PlayerSectionData, TournamentSectionData } from "./types";

export function generateFideReport(
  tournamentSectionData: TournamentSectionData,
  playerSectionData: PlayerSectionData,
) {
  return generatePlayerSection(playerSectionData);
}
