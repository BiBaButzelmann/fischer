import { auth } from "@/auth/utils";
import { getParticipantByUserIdAndTournamentId } from "@/db/repositories/participant";
import {
  getPendingGamesByParticipantId,
  getPendingGamesByRefereeId,
} from "@/db/repositories/game";
import { NotificationBell } from "./notification-bell";
import { getRefereeByUserIdAndTournamentId } from "@/db/repositories/referee";
import { PendingResultItem } from "./pending-result-item";

export async function NotificationCenter({
  tournamentId,
}: {
  tournamentId: number;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const participant = await getParticipantByUserIdAndTournamentId(
    session.user.id,
    tournamentId,
  );
  const participantGameIds = participant
    ? await getPendingGamesByParticipantId(participant.id)
    : [];

  const referee = await getRefereeByUserIdAndTournamentId(
    session.user.id,
    tournamentId,
  );
  const refereeGameIds = referee
    ? await getPendingGamesByRefereeId(referee.id)
    : [];

  if (!participant && !referee) {
    return null;
  }

  const gameIds = new Set([...participantGameIds, ...refereeGameIds]);

  return (
    <NotificationBell
      gameItems={Array.from(gameIds).map((id) => (
        <PendingResultItem
          key={id}
          gameId={id}
          participantId={participant?.id}
        />
      ))}
    />
  );
}
