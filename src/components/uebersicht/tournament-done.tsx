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
        <Card className="relative overflow-hidden border-amber-200 bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-950/20">
          <ConfettiCorner />
          <div className="relative p-6">
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

function ConfettiCorner() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 96 96"
      className="pointer-events-none absolute right-0 top-0 h-24 w-24 opacity-70"
    >
      <rect
        x="74"
        y="10"
        width="6"
        height="6"
        rx="1"
        fill="#f59e0b"
        transform="rotate(20 77 13)"
      />
      <rect
        x="86"
        y="28"
        width="5"
        height="5"
        rx="1"
        fill="#fbbf24"
        transform="rotate(-18 88 30)"
      />
      <rect
        x="60"
        y="6"
        width="4"
        height="4"
        rx="1"
        fill="#d97706"
        transform="rotate(35 62 8)"
      />
      <rect
        x="68"
        y="40"
        width="5"
        height="5"
        rx="1"
        fill="#fbbf24"
        transform="rotate(12 70 42)"
      />
      <circle cx="58" cy="24" r="2.5" fill="#fcd34d" />
      <circle cx="82" cy="46" r="2" fill="#f59e0b" />
      <circle cx="90" cy="14" r="2" fill="#fcd34d" />
      <circle cx="48" cy="14" r="1.8" fill="#fbbf24" />
    </svg>
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
