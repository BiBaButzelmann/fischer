import { generatHeaderSection } from "./header-section";
import { generatePlayerSection } from "./player-section";
import { generateTournamentSection } from "./tournament-section";
import type {
  HeaderSectionData,
  PlayerSectionData,
  TournamentSectionData,
} from "./types";

export function generateDwzReport(
  headerSectionData: HeaderSectionData,
  playerSectionData: PlayerSectionData,
  tournamentSectionData: TournamentSectionData,
) {
  const headerSection = generatHeaderSection(headerSectionData);
  const playerSection = generatePlayerSection(playerSectionData);
  const tournamentSection = generateTournamentSection(tournamentSectionData);

  return `${headerSection}\r
${playerSection}\r
${tournamentSection}\r`;
}
