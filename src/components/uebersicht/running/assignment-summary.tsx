import { Users, User, Wrench, Gavel, Hash, Scale, Check } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { matchDays } from "@/constants/constants";
import { getGroupNameAndDayOfWeekByProfileIdAndTournamentId } from "@/db/repositories/group";
import { getRefereeAssignmentCountByProfileIdAndTournamentId } from "@/db/repositories/referee";
import { getMatchEnteringHelperAssignmentCountByProfileIdAndTournamentId } from "@/db/repositories/match-entering-helper";
import { getSetupHelperAssignmentCountByProfileIdAndTournamentId } from "@/db/repositories/setup-helper";
import { RolesData } from "@/db/types/role";

type Props = {
  profileId: number;
  tournamentId: number;
  rolesData: RolesData;
};

export async function AssignmentSummary({
  profileId,
  tournamentId,
  rolesData,
}: Props) {
  return (
    <div className="border border-border rounded-lg bg-card shadow-sm p-6">
      <div className="text-center space-y-2 mb-6">
        <h1 className="font-heading font-black text-2xl md:text-3xl text-foreground">
          Meine Daten
        </h1>
        <p className="text-muted-foreground font-medium">
          Übersicht deiner Daten für das Turnier
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-80 flex-shrink-0">
          {rolesData.participant && (
            <ParticipantSection
              profileId={profileId}
              tournamentId={tournamentId}
            />
          )}
        </div>

        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rolesData.setupHelper && (
              <SetupHelperSection
                profileId={profileId}
                tournamentId={tournamentId}
              />
            )}
            {rolesData.referee && (
              <RefereeSection
                profileId={profileId}
                tournamentId={tournamentId}
              />
            )}
            {rolesData.matchEnteringHelper && (
              <MatchEnteringHelperSection
                profileId={profileId}
                tournamentId={tournamentId}
              />
            )}
            {rolesData.juror && <JurorSection />}
          </div>
        </div>
      </div>
    </div>
  );
}

async function ParticipantSection({
  profileId,
  tournamentId,
}: {
  profileId: number;
  tournamentId: number;
}) {
  const playerGroup = await getGroupNameAndDayOfWeekByProfileIdAndTournamentId(
    profileId,
    tournamentId,
  );

  if (!playerGroup) {
    return (
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 h-24">
        <CardContent className="p-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="h-8 w-8 text-primary" />
            <span className="font-heading font-bold text-lg">Spieler</span>
          </div>
          <Badge
            variant="outline"
            className="border-muted-foreground text-muted-foreground font-bold text-lg px-4 py-2"
          >
            Gruppe noch nicht zugeteilt
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 h-24">
      <CardContent className="p-4 h-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <User className="h-8 w-8 text-primary" />
          <span className="font-heading font-bold text-lg">Spieler</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="border-accent text-accent font-bold text-lg px-4 py-2"
          >
            {playerGroup.groupName}
          </Badge>
          <Badge
            variant="outline"
            className="border-accent text-accent font-bold text-lg px-4 py-2"
          >
            {playerGroup.dayOfWeek
              ? matchDays[playerGroup.dayOfWeek]
              : "Spieltag noch nicht zugeteilt"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

async function SetupHelperSection({
  profileId,
  tournamentId,
}: {
  profileId: number;
  tournamentId: number;
}) {
  const assignedDaysCount =
    await getSetupHelperAssignmentCountByProfileIdAndTournamentId(
      profileId,
      tournamentId,
    );

  if (assignedDaysCount === 0) {
    return null;
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 h-24">
      <CardContent className="p-4 h-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wrench className="h-8 w-8 text-primary" />
          <span className="font-heading font-bold text-lg">Aufbauhelfer</span>
        </div>
        <Badge
          variant="outline"
          className="border-accent text-accent font-bold text-lg px-4 py-2"
        >
          {assignedDaysCount} Tage
        </Badge>
      </CardContent>
    </Card>
  );
}

async function RefereeSection({
  profileId,
  tournamentId,
}: {
  profileId: number;
  tournamentId: number;
}) {
  const assignedDaysCount =
    await getRefereeAssignmentCountByProfileIdAndTournamentId(
      profileId,
      tournamentId,
    );

  if (assignedDaysCount === 0) {
    return null;
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 h-24">
      <CardContent className="p-4 h-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Gavel className="h-8 w-8 text-primary" />
          <span className="font-heading font-bold text-lg">Schiedsrichter</span>
        </div>
        <Badge
          variant="outline"
          className="border-accent text-accent font-bold text-lg px-4 py-2"
        >
          {assignedDaysCount} Tage
        </Badge>
      </CardContent>
    </Card>
  );
}

async function MatchEnteringHelperSection({
  profileId,
  tournamentId,
}: {
  profileId: number;
  tournamentId: number;
}) {
  const assignedGroupsCount =
    await getMatchEnteringHelperAssignmentCountByProfileIdAndTournamentId(
      profileId,
      tournamentId,
    );

  if (assignedGroupsCount === 0) {
    return null;
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 h-24">
      <CardContent className="p-4 h-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Hash className="h-8 w-8 text-primary" />
          <span className="font-heading font-bold text-lg">Eingabehelfer</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg text-accent">
            {assignedGroupsCount}
          </span>
          <Users className="h-6 w-6 text-accent" />
        </div>
      </CardContent>
    </Card>
  );
}

function JurorSection() {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 h-24">
      <CardContent className="p-4 h-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Scale className="h-8 w-8 text-primary" />
          <span className="font-heading font-bold text-lg mr-4">
            Turniergericht
          </span>
        </div>
        <Check className="h-8 w-8 text-accent" />
      </CardContent>
    </Card>
  );
}
