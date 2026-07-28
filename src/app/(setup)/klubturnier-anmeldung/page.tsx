import { authWithRedirect } from "@/auth/utils";
import {
  ParticipantEloPrefill,
  RolesManager,
} from "@/components/klubturnier-anmeldung/roles-manager";
import { getDsbPersonById, searchDsbPersons } from "@/lib/dsb/wertungsportal";
import { mapDsbPersonToCandidate } from "@/lib/dsb/candidate";
import { getFideProfile } from "@/lib/fide/profile";
import { Participant } from "@/db/types/participant";
import { Profile } from "@/db/types/profile";
import { getProfileByUserId } from "@/db/repositories/profile";
import { getRolesDataByProfileIdAndTournamentId } from "@/db/repositories/role";
import {
  getMostRecentDoneTournament,
  getOpenRegistrationTournament,
} from "@/db/repositories/tournament";
import { getParticipantByProfileIdAndTournamentId } from "@/db/repositories/participant";
import { getPromotionEligibility } from "@/services/promotion";
import { redirect } from "next/navigation";

async function getPrefillEloData(
  profile: Profile,
  previousParticipant: Participant,
): Promise<ParticipantEloPrefill | null> {
  try {
    const person = previousParticipant.dsbPersonId
      ? await getDsbPersonById(previousParticipant.dsbPersonId)
      : await findUniqueDsbPersonByName(profile.firstName, profile.lastName);

    if (person) {
      const candidate = mapDsbPersonToCandidate(person);
      const fideProfile = candidate.fideId
        ? await getFideProfile(candidate.fideId)
        : null;
      return {
        dsbPersonId: candidate.nuLigaPersonId,
        gender: candidate.gender,
        dwzRating: candidate.dwzRating,
        fideId: candidate.fideId,
        fideRating: fideProfile?.fideRating ?? null,
        birthYear: candidate.birthYear,
      };
    }

    if (previousParticipant.fideId) {
      const fideProfile = await getFideProfile(previousParticipant.fideId);
      if (fideProfile?.fideRating != null) {
        return { fideRating: fideProfile.fideRating };
      }
    }
  } catch {}
  return null;
}

async function findUniqueDsbPersonByName(firstName: string, lastName: string) {
  const persons = await searchDsbPersons(firstName, lastName);
  return persons.length === 1 ? persons[0] : null;
}

async function getDsbRatingRefresh(
  dsbPersonId: string,
): Promise<ParticipantEloPrefill | null> {
  try {
    const person = await getDsbPersonById(dsbPersonId);
    if (!person) {
      return null;
    }
    const candidate = mapDsbPersonToCandidate(person);
    const fideProfile = candidate.fideId
      ? await getFideProfile(candidate.fideId)
      : null;
    return {
      dsbPersonId: candidate.nuLigaPersonId,
      dwzRating: candidate.dwzRating,
      fideId: candidate.fideId,
      fideRating: fideProfile?.fideRating ?? null,
      birthYear: candidate.birthYear,
      gender: candidate.gender,
    };
  } catch {
    return null;
  }
}

export default async function RolesPage() {
  const session = await authWithRedirect();

  const [profile, tournament] = await Promise.all([
    getProfileByUserId(session.user.id),
    getOpenRegistrationTournament(),
  ]);
  if (!profile) {
    redirect("/willkommen");
  }

  if (!tournament) {
    return (
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Anmeldung zum Klubturnier
        </h1>
        <p className="text-muted-foreground">
          Aktuell ist keine Anmeldung möglich – es befindet sich kein Turnier in
          der Anmeldephase.
        </p>
      </div>
    );
  }

  const [initialValues, promotionEligibility] = await Promise.all([
    getRolesDataByProfileIdAndTournamentId(profile.id, tournament.id),
    getPromotionEligibility(profile.id),
  ]);

  const previousTournament = await getMostRecentDoneTournament();
  const previousParticipant = previousTournament
    ? await getParticipantByProfileIdAndTournamentId(
        profile.id,
        previousTournament.id,
      )
    : null;

  const prefillEloData = initialValues.participant?.dsbPersonId
    ? await getDsbRatingRefresh(initialValues.participant.dsbPersonId)
    : initialValues.participant == null && previousParticipant != null
      ? await getPrefillEloData(profile, previousParticipant)
      : null;

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Anmeldung zum {tournament.name}
        </h1>
        <p className="text-muted-foreground mt-2">
          Führe eine oder mehrere Anmeldungen durch und gib deine Informationen
          dazu an.
        </p>
      </header>
      <RolesManager
        key={JSON.stringify(initialValues)}
        userId={session.user.id}
        rolesData={initialValues}
        tournament={tournament}
        profile={profile}
        promotionEligibility={promotionEligibility}
        previousParticipant={previousParticipant ?? null}
        prefillEloData={prefillEloData}
      />
    </div>
  );
}
