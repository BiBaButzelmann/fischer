import { PostponementGrid } from "@/components/postponements/postponement-grid";
import { authWithRedirect } from "@/auth/utils";
import {
  getPostponementsForUser as getUserPostponements,
  getPostponementsForAdmin as getAdminPostponements,
} from "@/db/repositories/postponement";
import { getLatestTournament } from "@/db/repositories/tournament";
import { getParticipantByProfileIdAndTournamentId } from "@/db/repositories/participant";
import { getProfileByUserId } from "@/db/repositories/profile";

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
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Partienverlegungen
          </h1>
        </div>

        <PostponementContent tournamentId={tournament.id} />
      </div>
    </div>
  );
}

async function PostponementContent({ tournamentId }: { tournamentId: number }) {
  const session = await authWithRedirect();
  const isAdmin = session.user.role === "admin";

  const postponements = isAdmin
    ? await getAdminPostponements(tournamentId)
    : await (async () => {
        const userProfile = await getProfileByUserId(session.user.id);
        if (!userProfile) return [];

        const userParticipant = await getParticipantByProfileIdAndTournamentId(
          userProfile.id,
          tournamentId,
        );

        return userParticipant
          ? await getUserPostponements([userParticipant.id])
          : [];
      })();

  return (
    <PostponementGrid
      postponements={postponements}
      isAdmin={isAdmin}
      tournamentId={tournamentId}
    />
  );
}
