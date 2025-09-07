import { Suspense } from "react";
import { PostponementGrid } from "@/components/postponements/postponement-grid";
import { authWithRedirect } from "@/auth/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  getPostponementsForUser as getUserPostponements,
  getPostponementsForAdmin as getAdminPostponements,
} from "@/db/repositories/postponement";
import { getLatestTournament } from "@/db/repositories/tournament";
import { getParticipantByProfileIdAndTournamentId } from "@/db/repositories/participant";
import { getProfileByUserId } from "@/db/repositories/profile";

function PostponementSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default async function PostponementPage() {
  const tournament = await getLatestTournament();

  if (!tournament) {
    return (
      <div className="container mx-auto py-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Partienverlegungen</h1>
            <p className="text-muted-foreground mt-2">
              Übersicht über alle verschobenen Partien
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <p className="text-lg">Aktuell ist kein Turnier verfügbar.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (tournament.stage !== "running") {
    return (
      <div className="container mx-auto py-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Partienverlegungen</h1>
            <p className="text-muted-foreground mt-2">
              Übersicht über alle verschobenen Partien
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <p className="text-lg">
                  Partienverlegungen sind nur während eines laufenden Turniers
                  verfügbar.
                </p>
                <p className="mt-2">
                  Das aktuelle Turnier befindet sich nicht in der Turnierphase.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Partienverlegungen</h1>
          <p className="text-muted-foreground mt-2">
            Übersicht über alle verschobenen Partien
          </p>
        </div>

        <Suspense fallback={<PostponementSkeleton />}>
          <PostponementContent tournamentId={tournament.id} />
        </Suspense>
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
