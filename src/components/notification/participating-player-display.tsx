import { isParticipantInGame } from "@/lib/game-auth";
import type { GameWithParticipantsAndDate } from "@/db/types/game";

type Props = {
  game: GameWithParticipantsAndDate;
  participantId?: number;
};

export function ParticipatingPlayerDisplay({ game, participantId }: Props) {
  const participantInfo = participantId
    ? isParticipantInGame(game, participantId)
    : { isInGame: false, isWhite: null };

  if (!participantInfo.isInGame) {
    return `${game.whiteParticipant.profile.firstName} ${game.whiteParticipant.profile.lastName} vs. ${game.blackParticipant.profile.firstName} ${game.blackParticipant.profile.lastName}`;
  }

  const opponentParticipant = participantInfo.isWhite
    ? game.blackParticipant
    : game.whiteParticipant;

  return `gegen ${opponentParticipant.profile.firstName} ${opponentParticipant.profile.lastName}`;
}
