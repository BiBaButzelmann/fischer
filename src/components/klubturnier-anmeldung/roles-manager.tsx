"use client";

import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { User, Shield, Wrench, ClipboardEdit, Gavel } from "lucide-react";
import { RoleCard } from "./role-card";
import { ParticipateForm } from "./forms/participant-form";
import { RefereeForm } from "./forms/referee-form";
import { MatchEnteringForm } from "./forms/match-entering-form";
import { SetupHelperForm } from "./forms/setup-helper-form";
import { JurorForm } from "./forms/juror-form";
import {
  hasSelectedAtLeastOneRole,
  RegistrationRolesData,
} from "@/db/types/role";
import { Tournament } from "@/db/types/tournament";
import { useState, useTransition } from "react";
import { z } from "zod";
import { participantFormSchema } from "@/schema/participant";
import { refereeFormSchema } from "@/schema/referee";
import { matchEnteringHelperFormSchema } from "@/schema/matchEnteringHelper";
import { setupHelperFormSchema } from "@/schema/setupHelper";
import { useRouter } from "next/navigation";
import { createParticipant, deleteParticipant } from "@/actions/participant";
import {
  createMatchEnteringHelper,
  deleteMatchEnteringHelper,
} from "@/actions/match-entering-helper";
import { createSetupHelper, deleteSetupHelper } from "@/actions/setup-helper";
import { createJuror, deleteJuror } from "@/actions/juror";
import Link from "next/link";
import { sendRolesSelectionSummaryEmail } from "@/actions/email/roles";
import { Profile } from "@/db/types/profile";
import { DEFAULT_CLUB_KEY, DEFAULT_CLUB_LABEL } from "@/constants/constants";
import { createReferee, deleteReferee } from "@/actions/referee";

type Props = {
  userId: string;
  rolesData: RegistrationRolesData;
  tournament: Tournament;
  profile: Profile;
};

export function RolesManager({
  userId,
  rolesData,
  tournament,
  profile,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [accordionValue, setAccordionValue] = useState<string>();

  const handleParticipateFormSubmit = async (
    data: z.infer<typeof participantFormSchema>,
  ) => {
    await createParticipant(tournament.id, data);
    router.refresh();
  };

  const handleDeleteParticipant = async () => {
    if (rolesData.participant) {
      await deleteParticipant(tournament.id, rolesData.participant.id);
      router.refresh();
    }
  };

  const handleRefereeFormSubmit = async (
    data: z.infer<typeof refereeFormSchema>,
  ) => {
    await createReferee(tournament.id, data);
    router.refresh();
  };

  const handleDeleteReferee = async () => {
    if (rolesData.referee) {
      await deleteReferee(tournament.id, rolesData.referee.id);
      router.refresh();
    }
  };
  const handleMatchEnteringHelperFormSubmit = async (
    data: z.infer<typeof matchEnteringHelperFormSchema>,
  ) => {
    await createMatchEnteringHelper(tournament.id, data);
    router.refresh();
  };

  const handleDeleteMatchEnteringHelper = async () => {
    if (rolesData.matchEnteringHelper) {
      await deleteMatchEnteringHelper(
        tournament.id,
        rolesData.matchEnteringHelper.id,
      );
      router.refresh();
    }
  };

  const handleSetupHelperFormSubmit = async (
    data: z.infer<typeof setupHelperFormSchema>,
  ) => {
    await createSetupHelper(tournament.id, data);
    router.refresh();
  };

  const handleDeleteSetupHelper = async () => {
    if (rolesData.setupHelper) {
      await deleteSetupHelper(tournament.id, rolesData.setupHelper.id);
      router.refresh();
    }
  };

  const handleJurorFormSubmit = async () => {
    await createJuror(tournament.id);
    router.refresh();
  };

  const handleDeleteJuror = async () => {
    if (rolesData.juror) {
      await deleteJuror(tournament.id, rolesData.juror.id);
      router.refresh();
    }
  };

  const handleSubmitRoleSelection = async () => {
    startTransition(async () => {
      await sendRolesSelectionSummaryEmail(userId, rolesData);
    });
  };

  return (
    <div className="space-y-6">
      <Accordion
        type="single"
        collapsible
        value={accordionValue}
        onValueChange={(value) => setAccordionValue(value)}
        className="w-full"
      >
        <RoleCard
          accordionId="participant"
          name="Spieler"
          description="Zum Klubturnier anmelden"
          completed={rolesData.participant != null}
          icon={User}
        >
          <ParticipateForm
            initialValues={
              rolesData.participant
                ? {
                    chessClubType:
                      rolesData.participant.chessClub === DEFAULT_CLUB_LABEL
                        ? DEFAULT_CLUB_KEY
                        : "other",
                    chessClub: rolesData.participant.chessClub,
                    preferredMatchDay: rolesData.participant.preferredMatchDay,
                    secondaryMatchDays:
                      rolesData.participant.secondaryMatchDays,
                    title: rolesData.participant.title ?? "noTitle",
                    nationality: rolesData.participant.nationality ?? undefined,
                    dwzRating: rolesData.participant.dwzRating ?? undefined,
                    fideRating: rolesData.participant.fideRating ?? undefined,
                    fideId: rolesData.participant.fideId ?? undefined,
                    birthYear: rolesData.participant.birthYear ?? undefined,
                    notAvailableDays:
                      rolesData.participant.notAvailableDays ?? [],
                  }
                : undefined
            }
            onSubmit={handleParticipateFormSubmit}
            onDelete={handleDeleteParticipant}
            tournament={tournament}
            profile={profile}
          />
        </RoleCard>
        <RoleCard
          accordionId="setupHelper"
          name="Aufbauhelfer"
          description="Als Aufbauhelfer anmelden"
          completed={rolesData.setupHelper != null}
          icon={Wrench}
        >
          <SetupHelperForm
            initialValues={rolesData.setupHelper ?? undefined}
            onSubmit={handleSetupHelperFormSubmit}
            onDelete={handleDeleteSetupHelper}
          />
        </RoleCard>
        <RoleCard
          accordionId="matchEnteringHelper"
          name="Eingabehelfer"
          description="Als Eingabehelfer anmelden"
          completed={rolesData.matchEnteringHelper != null}
          icon={ClipboardEdit}
        >
          <MatchEnteringForm
            initialValues={rolesData.matchEnteringHelper ?? undefined}
            onSubmit={handleMatchEnteringHelperFormSubmit}
            onDelete={handleDeleteMatchEnteringHelper}
          />
        </RoleCard>
        <RoleCard
          accordionId="referee"
          name="Schiedsrichter"
          description="Als Schiedsrichter anmelden"
          completed={rolesData.referee != null}
          icon={Shield}
        >
          <RefereeForm
            initialValues={
              rolesData.referee
                ? {
                    fideId: rolesData.referee.fideId,
                    preferredMatchDay: rolesData.referee.preferredMatchDay,
                    secondaryMatchDays: rolesData.referee.secondaryMatchDays,
                  }
                : undefined
            }
            onSubmit={handleRefereeFormSubmit}
            onDelete={handleDeleteReferee}
          />
        </RoleCard>

        <RoleCard
          accordionId="juror"
          name="Turniergericht"
          description="Am Turniergericht teilnehmen"
          completed={rolesData.juror != null}
          icon={Gavel}
        >
          <JurorForm
            initiallyParticipating={rolesData.juror != null ? true : undefined}
            onSubmit={handleJurorFormSubmit}
            onDelete={handleDeleteJuror}
          />
        </RoleCard>
      </Accordion>
      {hasSelectedAtLeastOneRole(rolesData) ? (
        <div className="flex">
          <Button
            disabled={isPending}
            onClick={handleSubmitRoleSelection}
            size="lg"
            className="w-full sm:w-auto sm:mx-auto"
            asChild
          >
            <Link href="/uebersicht">Anmeldung abschließen</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
