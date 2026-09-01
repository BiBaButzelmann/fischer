import { authWithRedirect } from "@/auth/utils";
import {
  ParticipantEloPrefill,
  RolesManager,
} from "@/components/klubturnier-anmeldung/roles-manager";
import { getDsbPersonById, searchDsbPersons } from "@/lib/dsb/wertungsportal";
import { mapDsbPersonToCandidate } from "@/lib/dsb/candidate";
import { HSK_VKZ } from "@/lib/dsb/constants";
import { DEFAULT_CLUB_LABEL } from "@/constants/constants";
import { getFideStandardRating } from "@/lib/fide/profile";
import { Participant } from "@/db/types/participant";
import { Profile } from "@/db/types/profile";
import { getProfileByUserId } from "@/db/repositories/profile";
import { getRolesDataByProfileIdAndTournamentId } from "@/db/repositories/role";
import {
  getAllTournaments,
  getMostRecentDoneTournament,
  getOpenRegistrationTournament,
} from "@/db/repositories/tournament";
import { getParticipantByProfileIdAndTournamentId } from "@/db/repositories/participant";
import { getPromotionEligibility } from "@/services/promotion";
import { redirect } from "next/navigation";
import Link from "next/link";
import { tournamentPath } from "@/lib/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDownIcon } from "lucide-react";

async function getPrefillEloData(
  profile: Profile,
  previousParticipant: Participant,
): Promise<ParticipantEloPrefill | null> {
  try {
    const person = previousParticipant.dsbPersonId
      ? await getDsbPersonById(previousParticipant.dsbPersonId)
      : await findUniqueDsbPersonByName(
          profile.firstName,
          profile.lastName,
          previousParticipant.chessClub === DEFAULT_CLUB_LABEL ? HSK_VKZ : null,
        );

    if (person) {
      const candidate = mapDsbPersonToCandidate(person);
      const fideRating = candidate.fideId
        ? await getFideStandardRating(candidate.fideId)
        : null;
      return {
        dsbPersonId: candidate.nuLigaPersonId,
        gender: candidate.gender,
        dwzRating: candidate.dwzRating,
        fideId: candidate.fideId,
        fideRating,
        birthYear: candidate.birthYear,
      };
    }

    if (previousParticipant.fideId) {
      const fideRating = await getFideStandardRating(previousParticipant.fideId);
      if (fideRating != null) {
        return { fideRating };
      }
    }
  } catch {}
  return null;
}

async function findUniqueDsbPersonByName(
  firstName: string,
  lastName: string,
  vkz: string | null,
) {
  const persons = await searchDsbPersons(firstName, lastName, vkz);
  return persons.length === 1 ? persons[0] : null;
}

export default async function RolesPage() {
  const session = await authWithRedirect();

  const [profile, tournament, tournaments] = await Promise.all([
    getProfileByUserId(session.user.id),
    getOpenRegistrationTournament(),
    getAllTournaments(),
  ]);
  if (!profile) {
    redirect("/willkommen");
  }

  const viewableTournaments = tournaments.filter(
    (t) => t.stage !== "registration",
  );

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
        <PastTournaments tournaments={viewableTournaments} />
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
    initialValues.participant == null && previousParticipant != null
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
      <PastTournaments tournaments={viewableTournaments} />
    </div>
  );
}

function PastTournaments({
  tournaments,
}: {
  tournaments: { id: number; name: string; slug: string }[];
}) {
  if (tournaments.length === 0) {
    return null;
  }

  return (
    <Collapsible className="mx-auto max-w-xs text-center">
      <CollapsibleTrigger className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        Frühere Turniere ansehen
        <ChevronDownIcon className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 flex flex-col items-center gap-1">
        {tournaments.map((t) => (
          <Link
            key={t.id}
            href={tournamentPath(t.slug, "/uebersicht")}
            className="text-sm text-primary underline underline-offset-2 hover:text-primary/80"
          >
            {t.name}
          </Link>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
