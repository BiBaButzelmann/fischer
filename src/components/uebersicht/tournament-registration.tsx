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
import { RoleSummary } from "./role-summary";

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

  const playerFirstName = profile != null ? `${profile.firstName}` : "Gast";

  return (
    <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-5">
      <div className="lg:col-span-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-4xl font-bold">
              Hallo, {playerFirstName}!
            </CardTitle>
            {session ? (
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

      {/* Role Summary */}
      {profile && (
        <div className="lg:col-span-5">
          <RoleSummary
            profileId={profile.id}
            tournamentId={tournament.id}
            showEditButton={tournament.stage === "registration"}
          />
        </div>
      )}

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
            <ScrollArea className="h-[500px] w-full pr-2">
              <Participants participants={participants} />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="flex h-full flex-col">
          <CardHeader>
            <CardTitle>Zeitplan</CardTitle>
            <CardDescription>Gesamtübersicht der Spieltermine.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-x-auto">
            <TournamentWeeks tournamentWeeks={tournamentWeeks} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
