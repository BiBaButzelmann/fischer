import { auth } from "@/auth/utils";
import { getParticipantByUserId } from "@/db/repositories/participant";
import {
  getPendingGamesByParticipantId,
  getPendingGamesByRefereeId,
} from "@/db/repositories/game";
import { NotificationBell } from "./notification-bell";
import { getRefereeByUserId } from "@/db/repositories/referee";

export async function NotificationCenter() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const participant = await getParticipantByUserId(session.user.id);
  const participantGameIds = participant
    ? await getPendingGamesByParticipantId(participant.id)
    : [];

  const referee = await getRefereeByUserId(session.user.id);
  const refereeGameIds = referee
    ? await getPendingGamesByRefereeId(referee.id)
    : [];

  const gameIds = [...new Set([...participantGameIds, ...refereeGameIds])];
  if (gameIds.length === 0) {
    return null;
  }

  return <NotificationBell gameIds={gameIds} participantId={participant?.id} />;
}
