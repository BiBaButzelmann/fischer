import {
  Users,
  User,
  Wrench,
  Shield,
  Gavel,
  Calendar,
  Hash,
  CheckCircle2,
} from "lucide-react";
import { getRolesDataByProfileIdAndTournamentId } from "@/db/repositories/role";
import { PropsWithChildren } from "react";
import { Participant } from "@/db/types/participant";
import { getTwz } from "@/lib/twz";
import { cn } from "@/lib/utils";
import { MatchEnteringHelper } from "@/db/types/match-entering-helper";
import { SetupHelper } from "@/db/types/setup-helper";
import { Referee } from "@/db/types/referee";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { matchDays } from "@/constants/constants";
import { Separator } from "@radix-ui/react-separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Props = {
  profileId: number;
  tournamentId: number;
  showEditButton?: boolean;
};

export async function RolesSummary({
  profileId,
  tournamentId,
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
              <User className="h-5 w-5 text-gray-600" />
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
              <PlayerSection participant={participant} />
            </div>
          ) : null}

          <div className="lg:col-span-5 md:space-y-2">
            {setupHelper != null ? (
              <SetupHelperSection setupHelper={setupHelper} />
            ) : null}

            {referee != null ? <RefereeSection referee={referee} /> : null}

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

function RatingCard({
  label,
  value,
  isTwz,
}: {
  label: string;
  value: number | null;
  isTwz: boolean;
}) {
  return (
    <div
      className={cn(
        "relative rounded-lg p-3 text-center border",
        isTwz
          ? "bg-primary/10 border-primary/40 ring-1 ring-primary/30"
          : "bg-gray-50 border-gray-200",
      )}
    >
      {isTwz && (
        <span className="absolute top-1 right-1.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
          TWZ
        </span>
      )}
      <div className="text-xl font-bold text-gray-900">{value ?? "-"}</div>
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
}

function PlayerSection({ participant }: { participant: Participant }) {
  const twz = getTwz(participant);
  const dwzIsTwz = participant.dwzRating !== null && participant.dwzRating === twz;
  const eloIsTwz = participant.fideRating !== null && participant.fideRating === twz;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-gray-100 rounded-md">
          <User className="h-4 w-4 text-gray-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Spieler</h3>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-2">
        <RatingCard label="DWZ" value={participant.dwzRating} isTwz={dwzIsTwz} />
        <RatingCard label="Elo" value={participant.fideRating} isTwz={eloIsTwz} />
      </div>
      <p className="text-xs text-gray-500">
        Die höhere Wertung zählt als Turnierwertungszahl (TWZ) für die
        Gruppeneinteilung.
      </p>
      {participant.fideId && (
        <p className="text-xs text-gray-500 mb-4">
          FIDE-ID:{" "}
          <span className="font-medium text-gray-700">{participant.fideId}</span>
        </p>
      )}

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
    </div>
  );
}

function SetupHelperSection({ setupHelper }: { setupHelper: SetupHelper }) {
  return (
    <RoleSection
      icon={<Wrench className="h-4 w-4 text-gray-600" />}
      title="Aufbauhelfer"
    >
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
    </RoleSection>
  );
}

function RefereeSection({ referee }: { referee: Referee }) {
  return (
    <RoleSection
      icon={<Gavel className="h-4 w-4 text-gray-600" />}
      title="Schiedsrichter"
    >
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
