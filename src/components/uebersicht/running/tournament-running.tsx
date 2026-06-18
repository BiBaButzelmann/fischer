import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Button } from "../../ui/button";
import Link from "next/link";
import { auth } from "@/auth/utils";
import { getProfileByUserId } from "@/db/repositories/profile";
import { getRolesDataByProfileIdAndTournamentId } from "@/db/repositories/role";
import { getUpcomingEventsByProfileAndTournament } from "@/db/repositories/calendar-events";
import { UpcomingEventsList } from "./upcoming-events-list";
import { ArrowRight, CalendarIcon } from "lucide-react";
import { AssignmentSummary } from "./assignment-summary";
import { ProfileWithName } from "@/db/types/profile";
import { Tournament } from "@/db/types/tournament";
import { TournamentWeeksSection } from "../tournament-weeks-section";
import { ParticipantsSection } from "../participants-section";
import { hasAnyRole } from "@/db/types/role";
import { tournamentPath } from "@/lib/navigation";

type Props = {
  tournament: Pick<Tournament, "id" | "slug">;
};

export async function TournamentRunning({ tournament }: Props) {
  const session = await auth();
  const profile =
    session != null ? await getProfileByUserId(session.user.id) : null;

  return (
    <div className="grid grid-cols-1 items-stretch gap-4 md:gap-8 lg:grid-cols-6">
      <div className="lg:col-span-6">
        {profile != null ? (
          <AuthedGreetingSection profile={profile} tournament={tournament} />
        ) : (
          <GuestGreetingSection />
        )}
      </div>

      <div className="lg:col-span-3">
        <TournamentWeeksSection tournamentId={tournament.id} />
      </div>

      <div className="lg:col-span-3">
        <ParticipantsSection
          tournamentId={tournament.id}
          profileId={profile?.id}
        />
      </div>
    </div>
  );
}

function GuestGreetingSection() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-4xl font-bold">Hallo, Gast!</CardTitle>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <p className="text-base text-muted-foreground">
            Das Klubturnier ist bereits gestartet! Wenn du dich dennoch noch für
            das Turnier anmelden möchtest, wende dich bitte an{" "}
            <a
              href="mailto:klubturnier@hsk1830.de"
              className="text-primary hover:underline"
            >
              klubturnier@hsk1830.de
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

async function AuthedGreetingSection({
  profile,
  tournament,
}: {
  profile: ProfileWithName;
  tournament: Pick<Tournament, "id" | "slug">;
}) {
  const [upcomingEvents, rolesData] = await Promise.all([
    getUpcomingEventsByProfileAndTournament(profile.id, tournament.id),
    getRolesDataByProfileIdAndTournamentId(profile.id, tournament.id),
  ]);

  if (!hasAnyRole(rolesData)) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-4xl font-bold">
                  Hallo, {profile.firstName}!
                </CardTitle>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-base text-muted-foreground">
              Das Klubturnier ist bereits gestartet! Wenn du dich dennoch noch
              für das Turnier anmelden möchtest, wende dich bitte an{" "}
              <a
                href="mailto:klubturnier@hsk1830.de"
                className="text-primary hover:underline"
              >
                klubturnier@hsk1830.de
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-4xl font-bold">
                Hallo, {profile.firstName}!
              </CardTitle>
              <CardDescription className="mt-2">
                Das Klubturnier ist gestartet! Klicke auf die Events für mehr
                Infos.
              </CardDescription>
            </div>
            <Link href={tournamentPath(tournament.slug, "/kalender")}>
              <Button variant="outline" className="group w-full sm:w-auto">
                Hier geht&apos;s zum Kalender
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <CalendarIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Keine anstehenden Termine</p>
            </div>
          ) : (
            <UpcomingEventsList
              events={upcomingEvents}
              slug={tournament.slug}
            />
          )}
        </CardContent>
      </Card>

      <AssignmentSummary
        profileId={profile.id}
        tournament={tournament}
        rolesData={rolesData}
      />
    </div>
  );
}
