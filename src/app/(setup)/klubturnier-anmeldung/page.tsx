import {
  getFideRatingById,
  getParticipantEloData,
} from "@/actions/participant";
import { authWithRedirect } from "@/auth/utils";
import {
  ParticipantEloPrefill,
  RolesManager,
} from "@/components/klubturnier-anmeldung/roles-manager";
import { DEFAULT_CLUB_LABEL } from "@/constants/constants";
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

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}

async function getPrefillEloData(
  profile: Profile,
  previousParticipant: Participant,
): Promise<ParticipantEloPrefill | null> {
  try {
    const eloData = await withTimeout(
      getParticipantEloData(profile.firstName, profile.lastName),
      5000,
    );
    if (eloData) {
      return eloData;
    }
    if (previousParticipant.fideId) {
      const fideRating = await withTimeout(
        getFideRatingById(previousParticipant.fideId),
        5000,
      );
      if (fideRating != null) {
        return { fideRating };
      }
    }
  } catch {}
  return null;
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

  const prefillEloData =
    initialValues.participant == null &&
    previousParticipant != null &&
    previousParticipant.chessClub === DEFAULT_CLUB_LABEL
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
