import {
  getAllGroupNamesByTournamentId,
  getParticipantsInGroup,
} from "@/db/repositories/game";
import { getStandings } from "@/services/standings";
import { StandingsDisplay } from "@/components/standings/standings-display";
import { Card, CardContent } from "@/components/ui/card";
import { Tournament } from "@/db/types/tournament";
import { Trophy } from "lucide-react";
import { auth } from "@/auth/utils";
import { getProfileByUserId } from "@/db/repositories/profile";
import { ParticipantsSection } from "./participants-section";

export async function TournamentDone({
  tournament,
  selectedGroupId,
  selectedRound,
}: {
  tournament: Pick<Tournament, "id" | "name" | "numberOfRounds">;
  selectedGroupId?: string;
  selectedRound?: string;
}) {
  const session = await auth();
  const profile =
    session != null ? await getProfileByUserId(session.user.id) : null;
  const greetingName = profile?.firstName ?? "Gast";

  const groups = await getAllGroupNamesByTournamentId(tournament.id);
  const rounds = Array.from(
    { length: tournament.numberOfRounds },
    (_, i) => i + 1,
  );
  const groupId = selectedGroupId ?? groups[0]?.id.toString();

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
        <Card className="border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="flex items-center gap-3 p-4">
            <Trophy className="h-6 w-6 shrink-0 text-yellow-500" />
            <p className="text-base font-medium">
              Herzlichen Glückwunsch an <strong>{champion}</strong> für das
              Gewinnen des {tournament.name}!
            </p>
          </CardContent>
        </Card>
      ) : null}
      <ParticipantsSection
        tournamentId={tournament.id}
        profileId={profile?.id}
      />
      {groups.length > 0 && groupId != null ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Rangliste</h2>
          <StandingsDisplay
            groups={groups}
            rounds={rounds}
            selectedGroupId={groupId}
            selectedRound={selectedRound}
            basePath="/uebersicht"
          />
        </div>
      ) : null}
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
