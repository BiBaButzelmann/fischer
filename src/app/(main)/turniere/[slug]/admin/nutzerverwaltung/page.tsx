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
import { RatingUpdatePanel } from "@/components/admin/rating-update-panel";
import { RoleRoster } from "@/components/admin/user-management/role-roster";
import {
  RosterTab,
  RosterTabsList,
} from "@/components/admin/user-management/roster-tabs";
import { formatMatchDays } from "@/lib/match-days";
import { compareByName } from "@/lib/participant";
import { Roster } from "@/components/admin/user-management/roster";
import { RatingsHeader } from "@/components/admin/user-management/ratings";
import { ParticipantRow } from "@/components/admin/user-management/participant-row";
import { ProfileRow } from "@/components/admin/user-management/profile-row";
import { DeactivatedRow } from "@/components/admin/user-management/deactivated-row";
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

  const trainerIdByProfileId = new Map(
    trainers.map((trainer) => [trainer.profile.id, trainer.id]),
  );
  const sortedParticipants = [...participants].sort((a, b) =>
    compareByName(a.profile, b.profile),
  );

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
          <Roster
            count={participants.length}
            emptyMessage="Für dieses Turnier hat sich noch niemand angemeldet."
            description="Unterstrichen ist die Turnierwertungszahl (TWZ), die höhere der beiden Wertungen."
            toolbar={<RatingUpdatePanel participants={participants} />}
            header={<RatingsHeader />}
          >
            {sortedParticipants.map((participant) => (
              <ParticipantRow
                key={participant.id}
                participant={participant}
                tournament={tournament}
              />
            ))}
          </Roster>
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
            emptyMessage="Für dieses Turnier hat sich kein Schiedsrichter gemeldet."
          />
        </TabsContent>

        <TabsContent value="jurors" className="mt-0">
          <RoleRoster
            members={jurors}
            tournament={tournament}
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
            emptyMessage="Für dieses Turnier hat sich kein Aufbauhelfer gemeldet."
          />
        </TabsContent>

        <TabsContent value="trainers" className="mt-0">
          <RoleRoster
            members={trainers}
            tournament={tournament}
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
            {disabledProfiles.map((profile) => (
              <DeactivatedRow
                key={profile.id}
                profile={profile}
                tournament={tournament}
              />
            ))}
          </Roster>
        </TabsContent>

        <TabsContent value="profiles" className="mt-0">
          <Roster
            count={allProfiles.length}
            emptyMessage="Es gibt noch keine registrierten Profile."
            description="Alle registrierten Konten, unabhängig vom Turnier. Endgültig löschen lässt sich ein Profil nur ohne Partien, Verlegungen und organisierte Turniere."
          >
            {allProfiles.map((profile) => (
              <ProfileRow
                key={profile.id}
                profile={profile}
                tournament={tournament}
                trainerId={trainerIdByProfileId.get(profile.id)}
              />
            ))}
          </Roster>
        </TabsContent>
      </Tabs>
    </div>
  );
}
