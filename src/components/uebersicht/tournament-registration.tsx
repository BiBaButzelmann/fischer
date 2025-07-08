import { Tournament } from "@/db/types/tournament";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Clock } from "lucide-react";
import { CountdownTimer } from "./countdown-timer";
import { auth } from "@/auth/utils";
import { getProfileByUserId } from "@/db/repositories/profile";
import { Participants } from "../participants/participants";
import { getParticipantsByTournamentId } from "@/db/repositories/participant";
import { ScrollArea } from "../ui/scroll-area";
import { getTournamentWeeksByTournamentId } from "@/db/repositories/tournamentWeek";
import { TournamentWeeks } from "./tournament-weeks";

type Props = {
  tournament: Tournament;
};

export async function TournamentRegistration({ tournament }: Props) {
  const session = await auth();
  const [participants, profile, tournamentWeeks] = await Promise.all([
    getParticipantsByTournamentId(tournament.id),
    session != null
      ? getProfileByUserId(session.user.id)
      : Promise.resolve(null),
    getTournamentWeeksByTournamentId(tournament.id),
  ]);

  const playerName =
    profile != null ? `${profile.firstName} ${profile.lastName}` : "Gast";

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-4xl font-bold">
              Hallo, {playerName}!
            </CardTitle>
            {playerName !== "Gast" ? (
              <CardDescription>
                Vielen Dank für deine Anmeldung!
              </CardDescription>
            ) : null}
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" /> Anmeldefrist endet in...
            </div>
            <CountdownTimer date={tournament.endRegistrationDate} />
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card>
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
          <CardContent className="h-[400px]">
            <ScrollArea className="h-full w-full pr-2">
              <Participants participants={participants} />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Zeitplan</CardTitle>
            <CardDescription>Gesamtübersicht der Spieltermine.</CardDescription>
          </CardHeader>
          <CardContent>
            <TournamentWeeks tournamentWeeks={tournamentWeeks} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
