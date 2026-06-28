import {
  getAllGroupNamesByTournamentId,
  getParticipantsInGroup,
} from "@/db/repositories/game";
import { getStandings } from "@/services/standings";
import { Card } from "@/components/ui/card";
import { Tournament } from "@/db/types/tournament";
import { auth } from "@/auth/utils";
import { getProfileByUserId } from "@/db/repositories/profile";
import { ParticipantsSection } from "./participants-section";

export async function TournamentDone({
  tournament,
}: {
  tournament: Pick<Tournament, "id" | "name">;
}) {
  const session = await auth();
  const profile =
    session != null ? await getProfileByUserId(session.user.id) : null;
  const greetingName = profile?.firstName ?? "Gast";

  const groups = await getAllGroupNamesByTournamentId(tournament.id);

  // TODO(next PR): identify the A group via the new group.tier column (0 = A)
  // instead of relying on groups[0] (first group by groupName).
  const champion = await getChampionName(groups[0]?.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Hallo, {greetingName}!
        </h1>
        <p className="mt-2 text-muted-foreground">
          Das {tournament.name} ist zu Ende. Wir danken dir für deine Teilnahme
          und freuen uns auf das nächste Mal!
        </p>
      </div>
      {champion != null ? (
        <Card className="border-amber-200 bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-950/20">
          <div className="p-6">
            <p className="text-lg">
              Wir gratulieren{" "}
              <span className="font-semibold text-amber-700 dark:text-amber-400">
                {champion}
              </span>{" "}
              als Sieger des {tournament.name}.
            </p>
          </div>
        </Card>
      ) : null}
      <ParticipantsSection
        tournamentId={tournament.id}
        profileId={profile?.id}
      />
    </div>
  );
}

async function getChampionName(aGroupId?: number) {
  if (aGroupId == null) {
    return null;
  }

  const [participants, standings] = await Promise.all([
    getParticipantsInGroup(aGroupId),
    getStandings(aGroupId),
  ]);

  const winnerId = standings[0]?.participantId;
  if (winnerId == null) {
    return null;
  }

  const winner = participants.find((participant) => participant.id === winnerId);
  if (winner == null) {
    return null;
  }

  const title = winner.title ? `${winner.title} ` : "";
  return `${title}${winner.profile.firstName} ${winner.profile.lastName}`;
}
