import { Tournament } from "@/db/types/tournament";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Clock } from "lucide-react";
import { CountdownTimer } from "./countdown-timer";
import { auth } from "@/auth/utils";
import { getProfileByUserId } from "@/db/repositories/profile";
import { RolesSummary } from "./roles-summary";
import { TournamentWeeksSection } from "../tournament-weeks-section";
import { ParticipantsSection } from "../participants-section";

type Props = {
  tournament: Tournament;
};

export async function TournamentRegistration({ tournament }: Props) {
  const session = await auth();
  const profile =
    session != null ? await getProfileByUserId(session.user.id) : null;

  return (
    <div className="grid grid-cols-1 items-stretch gap-4 md:gap-8 lg:grid-cols-6">
      <div className="lg:col-span-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-4xl font-bold">
              Hallo, {profile != null ? `${profile.firstName}` : "Gast"}!
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

      {profile && (
        <div className="lg:col-span-6">
          <RolesSummary
            profileId={profile.id}
            tournamentId={tournament.id}
            showEditButton={tournament.stage === "registration"}
          />
        </div>
      )}

      <TournamentWeeksSection tournamentId={tournament.id} />

      <ParticipantsSection
        tournamentId={tournament.id}
        profileId={profile?.id}
      />
    </div>
  );
}
