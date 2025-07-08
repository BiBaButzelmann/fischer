"use client";

import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { User, Shield, Wrench, ClipboardEdit, Gavel } from "lucide-react";
import { RoleCard } from "./role-card";
import { ParticipateForm } from "./forms/participate-form";
import { RefereeForm } from "./forms/referee-form";
import { MatchEnteringForm } from "./forms/match-entering-form";
import { SetupHelperForm } from "./forms/setup-helper-form";
import { JurorForm } from "./forms/juror-form";
import { Role, RolesData } from "@/db/types/role";
import { useState, useTransition } from "react";
import { z } from "zod";
import { participantFormSchema } from "@/schema/participant";
import { refereeFormSchema } from "@/schema/referee";
import { matchEnteringHelperFormSchema } from "@/schema/matchEnteringHelper";
import { setupHelperFormSchema } from "@/schema/setupHelper";
import { useRouter } from "next/navigation";
import { createParticipant, deleteParticipant } from "@/actions/participant";
import { createReferee, deleteReferee } from "@/actions/referee";
import {
  createMatchEnteringHelper,
  deleteMatchEnteringHelper,
} from "@/actions/match-entering-helper";
import { createSetupHelper, deleteSetupHelper } from "@/actions/setup-helper";
import { createJuror, deleteJuror } from "@/actions/juror";
import Link from "next/link";
import { sendRolesSelectionSummaryEmail } from "@/actions/email/roles";

type Props = {
  tournamentId: number;
  userId: string;
  rolesData: RolesData;
};

export function RolesManager({ tournamentId, userId, rolesData }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [accordionValue, setAccordionValue] = useState(
    getAccordionValue(rolesData),
  );

  const handleParticipateFormSubmit = async (
    data: z.infer<typeof participantFormSchema>,
  ) => {
    await createParticipant(tournamentId, data);
    router.refresh();
  };

  const handleDeleteParticipant = async () => {
    if (rolesData.participant) {
      await deleteParticipant(rolesData.participant.id);
      router.refresh();
    }
  };

  const handleRefereeFormSubmit = async (
    data: z.infer<typeof refereeFormSchema>,
  ) => {
    await createReferee(tournamentId, data);
    router.refresh();
  };

  const handleDeleteReferee = async () => {
    if (rolesData.referee) {
      await deleteReferee(rolesData.referee.id);
      router.refresh();
    }
  };
  const handleMatchEnteringHelperFormSubmit = async (
    data: z.infer<typeof matchEnteringHelperFormSchema>,
  ) => {
    await createMatchEnteringHelper(tournamentId, data);
    router.refresh();
  };

  const handleDeleteMatchEnteringHelper = async () => {
    if (rolesData.matchEnteringHelper) {
      await deleteMatchEnteringHelper(rolesData.matchEnteringHelper.id);
      router.refresh();
    }
  };

  const handleSetupHelperFormSubmit = async (
    data: z.infer<typeof setupHelperFormSchema>,
  ) => {
    await createSetupHelper(tournamentId, data);
    router.refresh();
  };

  const handleDeleteSetupHelper = async () => {
    if (rolesData.setupHelper) {
      await deleteSetupHelper(rolesData.setupHelper.id);
      router.refresh();
    }
  };

  const handleJurorFormSubmit = async () => {
    await createJuror(tournamentId);
    router.refresh();
  };

  const handleDeleteJuror = async () => {
    if (rolesData.juror) {
      await deleteJuror(rolesData.juror.id);
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
        onValueChange={(value) =>
          setAccordionValue(value as RolesWithoutAdmin | undefined)
        }
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
                    chessClub: rolesData.participant.chessClub,
                    preferredMatchDay: rolesData.participant.preferredMatchDay,
                    secondaryMatchDays:
                      rolesData.participant.secondaryMatchDays,
                    dwzRating: rolesData.participant.dwzRating ?? undefined,
                    fideRating: rolesData.participant.fideRating ?? undefined,
                    fideId: rolesData.participant.fideId ?? undefined,
                  }
                : undefined
            }
            onSubmit={handleParticipateFormSubmit}
            onDelete={handleDeleteParticipant}
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
            initialValues={rolesData.referee ?? undefined}
            onSubmit={handleRefereeFormSubmit}
            onDelete={handleDeleteReferee}
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
      {hasSelectedMoreThanOneRole(rolesData) ? (
        <div className="flex justify-center pt-6">
          <Button
            disabled={isPending}
            onClick={handleSubmitRoleSelection}
            size="lg"
            className="w-full sm:w-auto"
            asChild
          >
            <Link href="/uebersicht">Anmeldung abschließen</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}

const ROLES = [
  "participant",
  "referee",
  "juror",
  "matchEnteringHelper",
  "setupHelper",
] as const;

type RolesWithoutAdmin = Exclude<Role, "admin">;

function getAccordionValue(roles: RolesData): RolesWithoutAdmin | undefined {
  for (const role of ROLES) {
    if (roles[role] === undefined) {
      return role;
    }
  }
}

function hasSelectedMoreThanOneRole(roles: RolesData): boolean {
  return Object.values(roles).filter((role) => role !== undefined).length > 0;
}
