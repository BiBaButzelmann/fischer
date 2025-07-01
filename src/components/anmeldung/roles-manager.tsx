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
import { Role } from "@/db/types/role";
import { useState } from "react";
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
import { Participant } from "@/db/types/participant";
import { Referee } from "@/db/types/referee";
import { MatchEnteringHelper } from "@/db/types/match-entering-helper";
import { SetupHelper } from "@/db/types/setup-helper";
import { Juror } from "@/db/types/juror";
import Link from "next/link";

type InitialValues = {
  participant: Participant | undefined;
  referee: Referee | undefined;
  matchEnteringHelper: MatchEnteringHelper | undefined;
  setupHelper: SetupHelper | undefined;
  juror: Juror | undefined;
};

type Props = {
  tournamentId: number;
  initialValues: InitialValues;
};

export function RolesManager({ tournamentId, initialValues }: Props) {
  const router = useRouter();
  const [accordionValue, setAccordionValue] = useState(
    getAccordionValue(initialValues),
  );

  const handleParticipateFormSubmit = async (
    data: z.infer<typeof participantFormSchema>,
  ) => {
    await createParticipant(tournamentId, data);
    router.refresh();
  };

  const handleDeleteParticipant = async () => {
    if (initialValues.participant) {
      await deleteParticipant(initialValues.participant.id);
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
    if (initialValues.referee) {
      await deleteReferee(initialValues.referee.id);
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
    if (initialValues.matchEnteringHelper) {
      await deleteMatchEnteringHelper(initialValues.matchEnteringHelper.id);
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
    if (initialValues.setupHelper) {
      await deleteSetupHelper(initialValues.setupHelper.id);
      router.refresh();
    }
  };

  const handleJurorFormSubmit = async () => {
    await createJuror(tournamentId);
    router.refresh();
  };

  const handleDeleteJuror = async () => {
    if (initialValues.juror) {
      await deleteJuror(initialValues.juror.id);
      router.refresh();
    }
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
          completed={initialValues.participant != null}
          icon={User}
        >
          <ParticipateForm
            initialValues={
              initialValues.participant
                ? {
                    chessClub: initialValues.participant.chessClub,
                    preferredMatchDay:
                      initialValues.participant.preferredMatchDay,
                    secondaryMatchDays:
                      initialValues.participant.secondaryMatchDays,
                    dwzRating: initialValues.participant.dwzRating ?? undefined,
                    fideRating:
                      initialValues.participant.fideRating ?? undefined,
                    fideId: initialValues.participant.fideId ?? undefined,
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
          completed={initialValues.referee != null}
          icon={Shield}
        >
          <RefereeForm
            initialValues={initialValues.referee ?? undefined}
            onSubmit={handleRefereeFormSubmit}
            onDelete={handleDeleteReferee}
          />
        </RoleCard>
        <RoleCard
          accordionId="matchEnteringHelper"
          name="Eingabehelfer"
          description="Als Eingabehelfer anmelden"
          completed={initialValues.matchEnteringHelper != null}
          icon={ClipboardEdit}
        >
          <MatchEnteringForm
            initialValues={initialValues.matchEnteringHelper ?? undefined}
            onSubmit={handleMatchEnteringHelperFormSubmit}
            onDelete={handleDeleteMatchEnteringHelper}
          />
        </RoleCard>
        <RoleCard
          accordionId="setupHelper"
          name="Aufbauhelfer"
          description="Als Aufbauhelfer anmelden"
          completed={initialValues.setupHelper != null}
          icon={Wrench}
        >
          <SetupHelperForm
            initialValues={initialValues.setupHelper ?? undefined}
            onSubmit={handleSetupHelperFormSubmit}
            onDelete={handleDeleteSetupHelper}
          />
        </RoleCard>
        <RoleCard
          accordionId="juror"
          name="Turniergericht"
          description="Am Turniergericht teilnehmen"
          completed={initialValues.juror != null}
          icon={Gavel}
        >
          <JurorForm
            initiallyParticipating={
              initialValues.juror != null ? true : undefined
            }
            onSubmit={handleJurorFormSubmit}
            onDelete={handleDeleteJuror}
          />
        </RoleCard>
      </Accordion>
      {hasSelectedMoreThanOneRole(initialValues) ? (
        <div className="flex justify-center pt-6">
          <Button size="lg" className="w-full sm:w-auto" asChild>
            <Link href="/home">Anmeldung abschließen</Link>
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

function getAccordionValue(
  roles: InitialValues,
): RolesWithoutAdmin | undefined {
  for (const role of ROLES) {
    if (roles[role] === undefined) {
      return role;
    }
  }
}

function hasSelectedMoreThanOneRole(roles: InitialValues): boolean {
  return Object.values(roles).filter((role) => role !== undefined).length > 0;
}
