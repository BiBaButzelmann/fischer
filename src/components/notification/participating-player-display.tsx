import { isParticipantInGame, isWhite } from "@/lib/game-auth";
import type { GameWithParticipantsAndDate } from "@/db/types/game";

type Props = {
  game: GameWithParticipantsAndDate;
  participantId?: number;
};

export function ParticipatingPlayerDisplay({ game, participantId }: Props) {
  if (!game.whiteParticipant || !game.blackParticipant) {
    return "Partie nicht verfügbar";
  }

  if (!participantId || !isParticipantInGame(game, participantId)) {
    return `${game.whiteParticipant.profile.firstName} ${game.whiteParticipant.profile.lastName} vs. ${game.blackParticipant.profile.firstName} ${game.blackParticipant.profile.lastName}`;
  }

  const opponentParticipant = isWhite(game, participantId)
    ? game.blackParticipant
    : game.whiteParticipant;

  return `gegen ${opponentParticipant.profile.firstName} ${opponentParticipant.profile.lastName}`;
}
