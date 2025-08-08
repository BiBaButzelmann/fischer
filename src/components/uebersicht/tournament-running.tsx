import { Tournament } from "@/db/types/tournament";
import { CalendarEvent } from "@/db/types/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { auth } from "@/auth/utils";
import { getProfileByUserId } from "@/db/repositories/profile";
import { Participants } from "../participants/participants";
import { getParticipantsByTournamentId } from "@/db/repositories/participant";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { getTournamentWeeksByTournamentId } from "@/db/repositories/tournamentWeek";
import { TournamentWeeks } from "./tournament-weeks";
import { RolesSummary } from "./roles-summary";
import { getNumberOfEventsByProfileAndTournament } from "@/db/repositories/calendar-events";
import { UpcomingEvents } from "./upcoming-events";

type Props = {
  tournament: Tournament;
};

export async function TournamentRunning({ tournament }: Props) {
  const session = await auth();
  const profile =
    session != null ? await getProfileByUserId(session.user.id) : null;

  let upcomingEvents: CalendarEvent[] = [];
  if (profile) {
    upcomingEvents = await getNumberOfEventsByProfileAndTournament(
      profile.id,
      tournament.id,
    );
  }

  const playerFirstName = profile != null ? profile.firstName : "Gast";

  const [participants, tournamentWeeks] = await Promise.all([
    getParticipantsByTournamentId(tournament.id),
    getTournamentWeeksByTournamentId(tournament.id),
  ]);

  return (
    <div className="grid grid-cols-1 items-stretch gap-4 md:gap-8 lg:grid-cols-6">
      <div className="lg:col-span-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-4xl font-bold">
              Hallo, {playerFirstName}!
            </CardTitle>
            <CardDescription>
              Das Klubturnier ist gestartet! Hier siehst du deine kommende
              Termine
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UpcomingEvents events={upcomingEvents} />
          </CardContent>
        </Card>
      </div>

      {profile && (
        <div className="lg:col-span-6">
          <RolesSummary
            profileId={profile.id}
            tournamentId={tournament.id}
            showEditButton={false}
          />
        </div>
      )}

      <div className="lg:col-span-3">
        <Card className="flex h-full flex-col">
          <CardHeader>
            <CardTitle>Zeitplan</CardTitle>
            <CardDescription>
              Gesamtübersicht der Spieltermine. An Feiertagen kann nicht
              gespielt werden.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ScrollArea className="w-full pb-3">
              <TournamentWeeks tournamentWeeks={tournamentWeeks} />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-3">
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
              <Participants
                profileId={profile?.id}
                participants={participants}
              />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
