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
import { Participants } from "../../participants/participants";
import { getParticipantsByTournamentId } from "@/db/repositories/participant";
import { ScrollArea, ScrollBar } from "../../ui/scroll-area";
import { getTournamentWeeksByTournamentId } from "@/db/repositories/tournamentWeek";
import { getUpcomingEventsByProfileAndTournament } from "@/db/repositories/calendar-events";
import { UpcomingEvents } from "./upcoming-events";
import { ArrowRight, CalendarIcon } from "lucide-react";
import { AssignmentSummary } from "./assignment-summary";
import { TournamentWeeks } from "../registration/tournament-weeks";
import { ProfileWithName } from "@/db/types/profile";

type Props = {
  tournamentId: number;
};

export async function TournamentRunning({ tournamentId }: Props) {
  const session = await auth();
  const profile =
    session != null ? await getProfileByUserId(session.user.id) : null;

  return (
    <div className="grid grid-cols-1 items-stretch gap-4 md:gap-8 lg:grid-cols-6">
      <div className="lg:col-span-6">
        {profile != null ? (
          <AuthedGreetingSection
            profile={profile}
            tournamentId={tournamentId}
          />
        ) : (
          <GuestGreetingSection />
        )}
      </div>

      {profile != null ? (
        <div className="lg:col-span-6">
          <AssignmentSummary
            profileId={profile.id}
            tournamentId={tournamentId}
          />
        </div>
      ) : null}

      <div className="lg:col-span-3">
        <TournamentWeeksSection tournamentId={tournamentId} />
      </div>

      <div className="lg:col-span-3">
        <ParticipantsSection
          tournamentId={tournamentId}
          profileId={profile?.id}
        />
      </div>
    </div>
  );
}

async function TournamentWeeksSection({
  tournamentId,
}: {
  tournamentId: number;
}) {
  const tournamentWeeks = await getTournamentWeeksByTournamentId(tournamentId);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Zeitplan</CardTitle>
        <CardDescription>
          Gesamtübersicht der Spieltermine. An Feiertagen kann nicht gespielt
          werden.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ScrollArea className="w-full pb-3">
          <TournamentWeeks tournamentWeeks={tournamentWeeks} />
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

async function ParticipantsSection({
  tournamentId,
  profileId,
}: {
  tournamentId: number;
  profileId?: number;
}) {
  const participants = await getParticipantsByTournamentId(tournamentId);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Teilnehmerliste</CardTitle>
        <CardDescription>
          Aktuelle Liste der{" "}
          <strong className="text-base font-bold text-foreground">
            {participants.length}
          </strong>{" "}
          angemeldeten Spieler.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ScrollArea className="h-[510px] w-full pr-3">
          <Participants profileId={profileId} participants={participants} />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function GuestGreetingSection() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-4xl font-bold">Hallo, Gast!</CardTitle>
            <CardDescription className="mt-2">
              Das Klubturnier ist gestartet! Klicke auf die Events für mehr
              Infos.
            </CardDescription>
          </div>
          <Link href="/kalender">
            <Button variant="outline" className="group w-full sm:w-auto">
              Hier geht&apos;s zum Kalender
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>bla bla bla</CardContent>
    </Card>
  );
}

async function AuthedGreetingSection({
  profile,
  tournamentId,
}: {
  profile: ProfileWithName;
  tournamentId: number;
}) {
  const upcomingEvents = await getUpcomingEventsByProfileAndTournament(
    profile.id,
    tournamentId,
  );

  return (
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
          <Link href="/kalender">
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
          <UpcomingEvents events={upcomingEvents} />
        )}
      </CardContent>
    </Card>
  );
}
