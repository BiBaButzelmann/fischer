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
  const referee = await getRefereeByUserId(session.user.id);

  if (!participant && !referee) {
    return null;
  }

  const participantGameIds = participant
    ? await getPendingGamesByParticipantId(participant.id)
    : [];

  const refereeGameIds = referee
    ? await getPendingGamesByRefereeId(referee.id)
    : [];

  const gameIds = [...new Set([...participantGameIds, ...refereeGameIds])];

  return <NotificationBell gameIds={gameIds} participantId={participant?.id} />;
}
