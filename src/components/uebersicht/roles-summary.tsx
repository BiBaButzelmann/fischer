import {
  Users,
  User,
  Wrench,
  Shield,
  Gavel,
  Trophy,
  Calendar,
  Hash,
  BellIcon,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { matchDays } from "../../constants/constants";
import { getRolesDataByProfileIdAndTournamentId } from "@/db/repositories/role";
import { PropsWithChildren } from "react";
import { Separator } from "../ui/separator";
import { ParticipantWithGroup } from "@/db/types/participant";
import { MatchEnteringHelper } from "@/db/types/match-entering-helper";
import { type Tournament } from "@/db/types/tournament";
import { SetupHelperWithAssignments } from "@/db/types/setup-helper";
import { RefereeWithAssignments } from "@/db/types/referee";

type Props = {
  profileId: number;
  tournamentId: number;
  tournamentStage: Tournament["stage"];
  showEditButton?: boolean;
};

export async function RolesSummary({
  profileId,
  tournamentId,
  tournamentStage,
  showEditButton = false,
}: Props) {
  const { participant, juror, referee, matchEnteringHelper, setupHelper } =
    await getRolesDataByProfileIdAndTournamentId(profileId, tournamentId);

  return (
    <Card>
      <CardHeader className="bg-white border-b rounded-t-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 border border-gray-200 rounded-lg">
              <Trophy className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Meine Anmeldungen
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Übersicht deiner Anmeldungen für das Turnier
              </p>
            </div>
          </div>
          {showEditButton ? (
            <Button asChild className="font-medium px-6">
              <a href="/klubturnier-anmeldung">Anmeldung anpassen</a>
            </Button>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
          {participant != null ? (
            <div className="lg:col-span-7 bg-white p-4 md:p-6 rounded-lg border border-gray-200">
              <PlayerSection
                participant={participant}
                tournamentStage={tournamentStage}
              />
            </div>
          ) : null}

          <div className="lg:col-span-5 md:space-y-2">
            {setupHelper != null ? (
              <SetupHelperSection
                setupHelper={setupHelper}
                tournamentStage={tournamentStage}
              />
            ) : null}

            {referee != null ? (
              <RefereeSection 
                referee={referee} 
                tournamentStage={tournamentStage}
              />
            ) : null}

            {matchEnteringHelper != null ? (
              <MatchEnteringHelperSection
                matchEnteringHelper={matchEnteringHelper}
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
  tournamentStage,
  participant,
}: {
  tournamentStage: Tournament["stage"];
  participant: ParticipantWithGroup;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-gray-100 rounded-md">
          <User className="h-4 w-4 text-gray-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Spieler</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
          <div className="text-xl font-bold text-gray-900">
            {participant.dwzRating ?? "-"}
          </div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            DWZ
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
          <div className="text-xl font-bold text-gray-900">
            {participant.fideRating ?? "-"}
          </div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Elo
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200 md:col-span-1 col-span-2">
          <div className="text-xl font-semibold text-gray-900">
            {participant.fideId ?? "-"}
          </div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            FIDE ID
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Verein</span>
        </div>
        <div className="ml-4">
          <Badge
            variant="outline"
            className="font-medium border-gray-300 text-gray-700"
          >
            {participant.chessClub}
          </Badge>
        </div>
      </div>

      <Separator className="my-4" />

      {tournamentStage === "running" && participant.group?.group ? (
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
                {participant.group.group.groupName}
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
                {participant.group.group.dayOfWeek
                  ? matchDays[participant.group.group.dayOfWeek]
                  : "Noch nicht festgelegt"}
              </Badge>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Bevorzugter Spieltag
              </span>
            </div>
            <div className="ml-6">
              <Badge className="bg-gray-900 text-white hover:bg-gray-800 font-medium">
                {matchDays[participant.preferredMatchDay]}
              </Badge>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                Alternative Spieltage
              </span>
            </div>
            <div className="ml-6 flex gap-2 flex-wrap">
              {participant.secondaryMatchDays.length > 0 ? (
                participant.secondaryMatchDays.map((day) => (
                  <Badge
                    key={day}
                    className="bg-gray-200 text-gray-800 hover:bg-gray-300 font-medium"
                  >
                    {matchDays[day]}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-gray-500">Keine</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SetupHelperSection({
  setupHelper,
  tournamentStage,
}: {
  setupHelper: SetupHelperWithAssignments;
  tournamentStage: Tournament["stage"];
}) {
  return (
    <RoleSection
      icon={<Wrench className="h-4 w-4 text-gray-600" />}
      title="Aufbauhelfer"
    >
      {tournamentStage === "running" ? (
        <div className="space-y-3">
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Zugeteilte Spieltage
            </div>
            <Badge className="bg-gray-800 text-white hover:bg-gray-700 font-medium">
              {setupHelper.assignedDaysCount} Tage
            </Badge>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Bevorzugter Tag
            </div>
            <Badge className="bg-gray-800 text-white hover:bg-gray-700 font-medium">
              {matchDays[setupHelper.preferredMatchDay]}
            </Badge>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Alternative Tage
            </div>
            <Badge
              variant="outline"
              className="border-gray-300 text-gray-600 font-medium"
            >
              {setupHelper.secondaryMatchDays.length > 0
                ? setupHelper.secondaryMatchDays
                    .map((day) => matchDays[day])
                    .join(", ")
                : "-"}
            </Badge>
          </div>
        </div>
      )}
    </RoleSection>
  );
}

function RefereeSection({ 
  referee, 
  tournamentStage 
}: { 
  referee: RefereeWithAssignments;
  tournamentStage: Tournament["stage"];
}) {
  return (
    <RoleSection
      icon={<BellIcon className="h-4 w-4 text-gray-600" />}
      title="Schiedsrichter"
    >
      {tournamentStage === "running" ? (
        <div className="space-y-3">
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Zugeteilte Spieltage
            </div>
            <Badge className="bg-gray-800 text-white hover:bg-gray-700 font-medium">
              {referee.assignedDaysCount} Tage
            </Badge>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Bevorzugter Tag
            </div>
            <Badge className="bg-gray-800 text-white hover:bg-gray-700 font-medium">
              {matchDays[referee.preferredMatchDay]}
            </Badge>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Alternative Tage
            </div>
            <Badge
              variant="outline"
              className="border-gray-300 text-gray-600 font-medium"
            >
              {referee.secondaryMatchDays.length > 0
                ? referee.secondaryMatchDays
                    .map((day) => matchDays[day])
                    .join(", ")
                : "-"}
            </Badge>
          </div>
        </div>
      )}
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
  matchEnteringHelper,
}: {
  matchEnteringHelper: MatchEnteringHelper;
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
          {matchEnteringHelper.numberOfGroupsToEnter}
        </span>
      </div>
    </RoleSection>
  );
}
