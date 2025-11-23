import { Game } from "@/db/types/game";

export function didParticipantForfeitGame(participantId: number, game: Game) {
  if (game.whiteParticipantId === participantId) {
    return game.result === "-:+" || game.result === "-:-";
  }
  if (game.blackParticipantId === participantId) {
    return game.result === "+:-" || game.result === "-:-";
  }
}
