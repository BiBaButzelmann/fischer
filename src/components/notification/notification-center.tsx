import { auth } from "@/auth/utils";
import { getParticipantByUserId } from "@/db/repositories/participant";
import { getGamesWithPendingResultByParticipantIdAndRefereeId } from "@/db/repositories/game";
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

  const uncompletedGames =
    await getGamesWithPendingResultByParticipantIdAndRefereeId(
      participant?.id,
      referee?.id,
    );

  return (
    <NotificationBell
      games={uncompletedGames}
      participantId={participant?.id}
    />
  );
}
