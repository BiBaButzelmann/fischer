import { PostponementGrid } from "@/components/postponements/postponement-grid";
import { authWithRedirect } from "@/auth/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { buildGameViewUrl } from "@/lib/navigation";
import {
  getPostponementsForUser as getUserPostponements,
  getPostponementsForAdmin as getAdminPostponements,
} from "@/db/repositories/postponement";
import { getLatestTournament } from "@/db/repositories/tournament";
import { getParticipantWithGroupByProfileIdAndTournamentId } from "@/db/repositories/participant";
import { getProfileByUserId } from "@/db/repositories/profile";
import { ArrowRight } from "lucide-react";
import { redirect } from "next/navigation";

export default async function PostponementPage() {
  const tournament = await getLatestTournament();

  if (!tournament) {
    return (
      <div>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Partienverlegungen
            </h1>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="pt-6 pb-6 px-6 text-center text-muted-foreground">
              <p className="text-lg">Aktuell ist kein Turnier verfügbar.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tournament.stage !== "running") {
    return (
      <div>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Partienverlegungen
            </h1>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="pt-6 pb-6 px-6 text-center text-muted-foreground">
              <p className="text-lg">
                Partienverlegungen sind nur während eines laufenden Turniers
                verfügbar.
              </p>
              <p className="mt-2">
                Das aktuelle Turnier befindet sich nicht in der Turnierphase.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-6">
        <PostponementContent tournamentId={tournament.id} />
      </div>
    </div>
  );
}

async function PostponementContent({ tournamentId }: { tournamentId: number }) {
  const session = await authWithRedirect();
  const isAdmin = session.user.role === "admin";

  const userProfile = await getProfileByUserId(session.user.id);
  const userParticipant = userProfile
    ? await getParticipantWithGroupByProfileIdAndTournamentId(
        userProfile.id,
        tournamentId,
      )
    : null;

  if (!isAdmin && !userParticipant) {
    redirect("/uebersicht");
  }

  const userParticipantId = userParticipant?.id;
  const userGroupId = userParticipant?.group?.group?.id;

  const postponements = isAdmin
    ? await getAdminPostponements(tournamentId)
    : await getUserPostponements([userParticipantId!]); // Safe: non-admins are guaranteed to be participants

  const partienUrl = userParticipantId
    ? buildGameViewUrl({
        tournamentId,
        participantId: userParticipantId,
        ...(userGroupId && { groupId: userGroupId }),
      })
    : buildGameViewUrl({ tournamentId });

  return (
    <div>
      <div className="flex items-center w-full">
        <h1 className="flex-1 text-3xl font-bold text-gray-900 mb-4">
          Partienverlegungen
        </h1>
        <Button variant="outline" asChild className="group">
          <Link href={partienUrl}>
            Hier geht&apos;s zu deinen Partien
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>

      <PostponementGrid
        postponements={postponements}
        isAdmin={isAdmin}
        tournamentId={tournamentId}
      />
    </div>
  );
}
