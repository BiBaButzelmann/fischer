import { authWithRedirect } from "@/auth/utils";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  getAllProfiles,
  getAllParticipantsByTournamentId,
  getAllRefereesByTournamentId,
  getAllJurorsByTournamentId,
  getAllMatchEnteringHelpersByTournamentId,
  getAllSetupHelpersByTournamentId,
  getAllTrainersByTournamentId,
  getDeactivatedProfilesByTournamentId,
} from "@/db/repositories/admin";
import { getTournamentBySlug } from "@/db/repositories/tournament";
import { tournamentPath } from "@/lib/navigation";
import { RoleRoster } from "@/components/admin/user-management/role-roster";
import {
  RosterTab,
  RosterTabsList,
} from "@/components/admin/user-management/roster-tabs";
import { formatMatchDays } from "@/lib/match-days";
import { Roster, RosterList } from "@/components/admin/user-management/roster";
import { ParticipantRoster } from "@/components/admin/user-management/participant-roster";
import { ProfileRoster } from "@/components/admin/user-management/profile-roster";
import { DeactivatedRow } from "@/components/admin/user-management/deactivated-row";
import { collectRolesByProfileId } from "@/components/admin/user-management/roles";
import { notFound, redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await authWithRedirect();
  const { slug } = await params;

  if (session.user.role !== "admin") {
    redirect(tournamentPath(slug, "/uebersicht"));
  }

  const [tournament, allProfiles] = await Promise.all([
    getTournamentBySlug(slug),
    getAllProfiles(),
  ]);

  if (!tournament) {
    notFound();
  }

  const [
    participants,
    referees,
    jurors,
    matchEnteringHelpers,
    setupHelpers,
    trainers,
    disabledProfiles,
  ] = await Promise.all([
    getAllParticipantsByTournamentId(tournament.id),
    getAllRefereesByTournamentId(tournament.id),
    getAllJurorsByTournamentId(tournament.id),
    getAllMatchEnteringHelpersByTournamentId(tournament.id),
    getAllSetupHelpersByTournamentId(tournament.id),
    getAllTrainersByTournamentId(tournament.id),
    getDeactivatedProfilesByTournamentId(tournament.id),
  ]);

  const trainerIdByProfileId: Record<number, number> = Object.fromEntries(
    trainers.map((trainer) => [trainer.profile.id, trainer.id]),
  );
  const rolesByProfileId = collectRolesByProfileId([
    { label: "Teilnehmer", members: participants },
    { label: "Schiedsrichter", members: referees },
    { label: "Juror", members: jurors },
    { label: "Eingabehelfer", members: matchEnteringHelpers },
    { label: "Aufbauhelfer", members: setupHelpers },
    { label: "Trainer", members: trainers },
  ]);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Nutzerverwaltung
        </h1>
        <p className="text-sm text-muted-foreground">{tournament.name}</p>
      </header>

      <Tabs defaultValue="participants" className="space-y-5">
        <RosterTabsList>
          <RosterTab
            value="participants"
            label="Teilnehmer"
            count={participants.length}
          />
          <RosterTab
            value="referees"
            label="Schiedsrichter"
            count={referees.length}
          />
          <RosterTab value="jurors" label="Juroren" count={jurors.length} />
          <RosterTab
            value="matchEnteringHelpers"
            label="Eingabehelfer"
            count={matchEnteringHelpers.length}
          />
          <RosterTab
            value="setupHelpers"
            label="Aufbauhelfer"
            count={setupHelpers.length}
          />
          <RosterTab value="trainers" label="Trainer" count={trainers.length} />
          <RosterTab
            value="disabled"
            label="Deaktiviert"
            count={disabledProfiles.length}
          />
          <RosterTab
            value="profiles"
            label="Alle Profile"
            count={allProfiles.length}
          />
        </RosterTabsList>

        <TabsContent value="participants" className="mt-0">
          <ParticipantRoster
            participants={participants}
            tournament={tournament}
            rolesByProfileId={rolesByProfileId}
          />
        </TabsContent>

        <TabsContent value="referees" className="mt-0">
          <RoleRoster
            members={referees.map((referee) => ({
              id: referee.id,
              profile: referee.profile,
              meta: formatMatchDays(
                referee.preferredMatchDay,
                referee.secondaryMatchDays,
              ),
            }))}
            tournament={tournament}
            rolesByProfileId={rolesByProfileId}
            emptyMessage="Für dieses Turnier hat sich kein Schiedsrichter gemeldet."
          />
        </TabsContent>

        <TabsContent value="jurors" className="mt-0">
          <RoleRoster
            members={jurors}
            tournament={tournament}
            rolesByProfileId={rolesByProfileId}
            emptyMessage="Für dieses Turnier gibt es noch kein Turniergericht."
          />
        </TabsContent>

        <TabsContent value="matchEnteringHelpers" className="mt-0">
          <RoleRoster
            members={matchEnteringHelpers.map((helper) => ({
              id: helper.id,
              profile: helper.profile,
              meta:
                helper.numberOfGroupsToEnter === 1
                  ? "1 Gruppe"
                  : `${helper.numberOfGroupsToEnter} Gruppen`,
            }))}
            tournament={tournament}
            rolesByProfileId={rolesByProfileId}
            emptyMessage="Für dieses Turnier hat sich kein Eingabehelfer gemeldet."
          />
        </TabsContent>

        <TabsContent value="setupHelpers" className="mt-0">
          <RoleRoster
            members={setupHelpers.map((helper) => ({
              id: helper.id,
              profile: helper.profile,
              meta: formatMatchDays(
                helper.preferredMatchDay,
                helper.secondaryMatchDays,
              ),
            }))}
            tournament={tournament}
            rolesByProfileId={rolesByProfileId}
            emptyMessage="Für dieses Turnier hat sich kein Aufbauhelfer gemeldet."
          />
        </TabsContent>

        <TabsContent value="trainers" className="mt-0">
          <RoleRoster
            members={trainers}
            tournament={tournament}
            rolesByProfileId={rolesByProfileId}
            emptyMessage="Für dieses Turnier ist kein Trainer eingetragen."
            description="Trainer sehen alle Partien des Turniers. Eintragen und entfernen unter „Alle Profile“."
          />
        </TabsContent>

        <TabsContent value="disabled" className="mt-0">
          <Roster
            count={disabledProfiles.length}
            emptyMessage="In diesem Turnier ist niemand deaktiviert."
            description="Deaktivierte Personen haben in diesem Turnier keine Rollen. Beim Wiederherstellen bleiben kampflos gewertete Partien bestehen."
          >
            <RosterList>
              {disabledProfiles.map((profile) => (
                <DeactivatedRow
                  key={profile.id}
                  profile={profile}
                  tournament={tournament}
                />
              ))}
            </RosterList>
          </Roster>
        </TabsContent>

        <TabsContent value="profiles" className="mt-0">
          <ProfileRoster
            profiles={allProfiles}
            tournament={tournament}
            rolesByProfileId={rolesByProfileId}
            trainerIdByProfileId={trainerIdByProfileId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
