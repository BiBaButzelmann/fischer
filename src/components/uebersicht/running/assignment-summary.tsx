import {
  Wrench,
  Gavel,
  Hash,
  Scale,
  Check,
  ClipboardList,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

import { matchDays } from "@/constants/constants";
import { getGroupNameAndDayOfWeekByProfileIdAndTournamentId } from "@/db/repositories/group";
import { getRefereeAssignmentCountByProfileIdAndTournamentId } from "@/db/repositories/referee";
import { getMatchEnteringHelperAssignmentCountByProfileIdAndTournamentId } from "@/db/repositories/match-entering-helper";
import { getSetupHelperAssignmentCountByProfileIdAndTournamentId } from "@/db/repositories/setup-helper";
import { RolesData } from "@/db/types/role";
import { buildResultsViewUrl } from "@/lib/navigation";

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
    <div className="bg-white dark:bg-card border border-gray-200 dark:border-card-border rounded-xl shadow-sm p-6">
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <ClipboardList className="h-4 w-4" /> Meine Daten
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rolesData.participant && (
            <ParticipantSection
              profileId={profileId}
              tournamentId={tournamentId}
            />
          )}
          {rolesData.setupHelper && (
            <SetupHelperSection
              profileId={profileId}
              tournamentId={tournamentId}
            />
          )}
          {rolesData.referee && (
            <RefereeSection profileId={profileId} tournamentId={tournamentId} />
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
      <div className="flex items-center gap-4 p-4 bg-white dark:bg-card border border-gray-200 dark:border-card-border rounded-xl shadow-sm transition-all hover:shadow-md">
        <div className="flex-shrink-0 p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center w-12 h-12">
          <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
            ?
          </span>
        </div>
        <div className="flex-grow">
          <p className="font-bold text-gray-800 dark:text-gray-100">Spieler</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gruppe noch nicht zugeteilt
          </p>
        </div>
      </div>
    );
  }

  const ranglisteUrl = buildResultsViewUrl({
    tournamentId: tournamentId.toString(),
    groupId: playerGroup.id.toString(),
  });

  return (
    <Link href={ranglisteUrl} className="block">
      <div className="flex items-center gap-4 p-4 bg-white dark:bg-card border border-gray-200 dark:border-card-border rounded-xl shadow-sm transition-all hover:shadow-md cursor-pointer hover:opacity-80">
        <div className="flex-shrink-0 p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center w-12 h-12">
          <span className="font-bold text-blue-600 dark:text-blue-400 text-xl">
            {playerGroup.groupName}
          </span>
        </div>
        <div className="flex-grow">
          <p className="font-bold text-gray-800 dark:text-gray-100">Spieler</p>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
            <span>
              {playerGroup.dayOfWeek
                ? matchDays[playerGroup.dayOfWeek]
                : "Spieltag noch nicht zugeteilt"}
            </span>
          </div>
        </div>
        <div className="flex-shrink-0">
          <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
        </div>
      </div>
    </Link>
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
    <Link href="/terminuebersicht" className="block">
      <div className="flex items-center gap-4 p-4 bg-white dark:bg-card border border-gray-200 dark:border-card-border rounded-xl shadow-sm transition-all hover:shadow-md cursor-pointer hover:opacity-80">
        <div className="flex-shrink-0 p-3 rounded-full bg-green-100 dark:bg-green-900/30">
          <Wrench className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        <div className="flex-grow">
          <p className="font-bold text-gray-800 dark:text-gray-100">
            Aufbauhelfer
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {assignedDaysCount === 1 ? (
              <>
                für <span className="font-bold">einen</span> Tag
              </>
            ) : (
              <>
                für <span className="font-bold">{assignedDaysCount}</span> Tage
              </>
            )}
          </p>
        </div>
        <div className="flex-shrink-0">
          <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
        </div>
      </div>
    </Link>
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
    <Link href="/terminuebersicht" className="block">
      <div className="flex items-center gap-4 p-4 bg-white dark:bg-card border border-gray-200 dark:border-card-border rounded-xl shadow-sm transition-all hover:shadow-md cursor-pointer hover:opacity-80">
        <div className="flex-shrink-0 p-3 rounded-full bg-red-100 dark:bg-red-900/30">
          <Gavel className="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>
        <div className="flex-grow">
          <p className="font-bold text-gray-800 dark:text-gray-100">
            Schiedsrichter
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {assignedDaysCount === 1 ? (
              <>
                für <span className="font-bold">einen</span> Tag
              </>
            ) : (
              <>
                für <span className="font-bold">{assignedDaysCount}</span> Tage
              </>
            )}
          </p>
        </div>
        <div className="flex-shrink-0">
          <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
        </div>
      </div>
    </Link>
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
    <Link href="/partieneingabe" className="block">
      <div className="flex items-center gap-4 p-4 bg-white dark:bg-card border border-gray-200 dark:border-card-border rounded-xl shadow-sm transition-all hover:shadow-md cursor-pointer hover:opacity-80">
        <div className="flex-shrink-0 p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
          <Hash className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="flex-grow">
          <p className="font-bold text-gray-800 dark:text-gray-100">
            Eingabehelfer
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
            <span>
              {assignedGroupsCount === 1 ? (
                <>
                  für <span className="font-bold">eine</span> Gruppe
                </>
              ) : (
                <>
                  für <span className="font-bold">{assignedGroupsCount}</span>{" "}
                  Gruppen
                </>
              )}
            </span>
          </div>
        </div>
        <div className="flex-shrink-0">
          <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
        </div>
      </div>
    </Link>
  );
}

function JurorSection() {
  return (
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-card border border-gray-200 dark:border-card-border rounded-xl shadow-sm transition-all hover:shadow-md">
      <div className="flex-shrink-0 p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
        <Scale className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
      </div>
      <div className="flex-grow">
        <p className="font-bold text-gray-800 dark:text-gray-100">
          Turniergericht
        </p>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
          <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
          <span>Mitglied</span>
        </div>
      </div>
    </div>
  );
}
