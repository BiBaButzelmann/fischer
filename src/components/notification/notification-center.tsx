import { auth } from "@/auth/utils";
import { getParticipantByUserId } from "@/db/repositories/participant";
import { getUncompletedGamesByParticipantId } from "@/db/repositories/game";
import { NotificationBell } from "./notification-bell";

export async function NotificationCenter() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const participant = await getParticipantByUserId(session.user.id);

  if (!participant) {
    return null;
  }
  // TODO: consider referees as well (for next PR)
  const uncompletedGames = await getUncompletedGamesByParticipantId(
    participant.id,
  );

  return (
    <NotificationBell games={uncompletedGames} participantId={participant.id} />
  );
}
