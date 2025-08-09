import {
  Users,
  User,
  Wrench,
  Gavel,
  Calendar,
  Hash,
  BellIcon,
  CheckCircle2,
  Badge,
} from "lucide-react";

import { PropsWithChildren } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { matchDays } from "@/constants/constants";
import { GroupNameAndDayOfWeek } from "@/db/types/group";
import { getGroupNameAndDayOfWeekByProfileIdAndTournamentId } from "@/db/repositories/group";
import { getJurorByProfileIdAndTournamentId } from "@/db/repositories/juror";
import { getRefereeAssignmentCountByProfileIdAndTournamentId } from "@/db/repositories/referee";
import { getMatchEnteringHelperAssignmentCountByProfileIdAndTournamentId } from "@/db/repositories/match-entering-helper";
import { getSetupHelperAssignmentCountByProfileIdAndTournamentId } from "@/db/repositories/setup-helper";

type Props = {
  profileId: number;
  tournamentId: number;
};

async function getAssignmentDataByProfileIdAndTournamentId(
  profileId: number,
  tournamentId: number,
) {
  const [
    playerGroup,
    setupHelperDaysCount,
    refereeDaysCount,
    matchEnteringHelperGroupsCount,
    juror,
  ] = await Promise.all([
    getGroupNameAndDayOfWeekByProfileIdAndTournamentId(profileId, tournamentId),
    getSetupHelperAssignmentCountByProfileIdAndTournamentId(
      profileId,
      tournamentId,
    ),
    getRefereeAssignmentCountByProfileIdAndTournamentId(
      profileId,
      tournamentId,
    ),
    getMatchEnteringHelperAssignmentCountByProfileIdAndTournamentId(
      profileId,
      tournamentId,
    ),
    getJurorByProfileIdAndTournamentId(profileId, tournamentId),
  ]);

  return {
    playerGroup,
    juror,
    assignmentCounts: {
      setupHelperDaysCount,
      refereeDaysCount,
      matchEnteringHelperGroupsCount,
    },
  };
}

export async function AssignmentSummary({ profileId, tournamentId }: Props) {
  const { playerGroup, juror, assignmentCounts } =
    await getAssignmentDataByProfileIdAndTournamentId(profileId, tournamentId);

  return (
    <Card>
      <CardHeader className="bg-white border-b rounded-t-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 border border-gray-200 rounded-lg">
              <User className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Meine Daten</h2>
              <p className="text-sm text-gray-600 mt-1">
                Übersicht deiner Daten für das Turnier.
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
          {playerGroup != null ? (
            <div className="lg:col-span-7 bg-white p-4 md:p-6 rounded-lg border border-gray-200">
              <PlayerSection playerGroup={playerGroup} />
            </div>
          ) : null}

          <div className="lg:col-span-5 md:space-y-2">
            {assignmentCounts.setupHelperDaysCount > 0 ? (
              <SetupHelperSection
                assignedDaysCount={assignmentCounts.setupHelperDaysCount}
              />
            ) : null}

            {assignmentCounts.refereeDaysCount > 0 ? (
              <RefereeSection
                assignedDaysCount={assignmentCounts.refereeDaysCount}
              />
            ) : null}

            {assignmentCounts.matchEnteringHelperGroupsCount > 0 ? (
              <MatchEnteringHelperSection
                assignedGroupsCount={
                  assignmentCounts.matchEnteringHelperGroupsCount
                }
              />
            ) : null}

            {juror != null ? <JurorSection /> : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RoleSection({
  icon,
  title,
  children,
}: PropsWithChildren<{ icon: React.ReactNode; title: string }>) {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-gray-100 rounded-md">{icon}</div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function PlayerSection({
  playerGroup,
}: {
  playerGroup: GroupNameAndDayOfWeek;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-gray-100 rounded-md">
          <User className="h-4 w-4 text-gray-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Spieler</h3>
      </div>
      <div className="space-y-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Meine Gruppe
            </span>
          </div>
          <div className="ml-6">
            <Badge className="bg-gray-900 text-white hover:bg-gray-800 font-medium">
              {playerGroup.groupName}
            </Badge>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Mein Gruppenspieltag
            </span>
          </div>
          <div className="ml-6">
            <Badge className="bg-gray-900 text-white hover:bg-gray-800 font-medium">
              {playerGroup.dayOfWeek
                ? matchDays[playerGroup.dayOfWeek]
                : "Wochentag noch nicht zugewiesen"}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

function SetupHelperSection({
  assignedDaysCount,
}: {
  assignedDaysCount: number;
}) {
  return (
    <RoleSection
      icon={<Wrench className="h-4 w-4 text-gray-600" />}
      title="Aufbauhelfer"
    >
      <div className="space-y-3">
        <div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Zugeteilte Spieltage
          </div>
          <Badge className="bg-gray-800 text-white hover:bg-gray-700 font-medium">
            {assignedDaysCount} Tage
          </Badge>
        </div>
      </div>
    </RoleSection>
  );
}

function RefereeSection({ assignedDaysCount }: { assignedDaysCount: number }) {
  return (
    <RoleSection
      icon={<BellIcon className="h-4 w-4 text-gray-600" />}
      title="Schiedsrichter"
    >
      <div className="space-y-3">
        <div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Zugeteilte Spieltage
          </div>
          <Badge className="bg-gray-800 text-white hover:bg-gray-700 font-medium">
            {assignedDaysCount} Tage
          </Badge>
        </div>
      </div>
    </RoleSection>
  );
}

function JurorSection() {
  return (
    <RoleSection
      icon={<Gavel className="h-4 w-4 text-gray-600" />}
      title="Turniergericht"
    >
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <span>Als Mitglied im Turniergericht angemeldet</span>
      </div>
    </RoleSection>
  );
}

function MatchEnteringHelperSection({
  assignedGroupsCount,
}: {
  assignedGroupsCount: number;
}) {
  return (
    <RoleSection
      icon={<Hash className="h-4 w-4 text-gray-600" />}
      title="Eingabehelfer"
    >
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-gray-600" />
        <span className="text-gray-700">Anzahl Gruppen:</span>
        <span className="text-lg font-bold text-gray-900">
          {assignedGroupsCount}
        </span>
      </div>
    </RoleSection>
  );
}
