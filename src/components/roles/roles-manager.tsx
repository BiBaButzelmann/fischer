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
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { participantFormSchema } from "@/schema/participant";
import { refereeFormSchema } from "@/schema/referee";
import { matchEnteringHelperFormSchema } from "@/schema/matchEnteringHelper";
import { setupHelperFormSchema } from "@/schema/setupHelper";
import { jurorFormSchema } from "@/schema/juror";
import { useRouter } from "next/navigation";
import { createParticipant } from "@/actions/participant";
import { createReferee } from "@/actions/referee";
import { createMatchEnteringHelper } from "@/actions/match-entering-helper";
import { createSetupHelper } from "@/actions/setup-helper";
import { createJuror } from "@/actions/juror";

export function RolesManager({
  tournamentId,
  roles,
}: {
  tournamentId: number;
  roles: Role[];
}) {
  const router = useRouter();
  const [accordionValue, setAccordionValue] = useState(
    getAccordionValue(roles),
  );

  useEffect(() => {
    setAccordionValue(getAccordionValue(roles));
  }, [roles]);

  const handleParticipateFormSubmit = async (
    data: z.infer<typeof participantFormSchema>,
  ) => {
    await createParticipant(tournamentId, data);
    router.refresh();
  };

  const handleRefereeFormSubmit = async (
    data: z.infer<typeof refereeFormSchema>,
  ) => {
    await createReferee(tournamentId, data);
    router.refresh();
  };

  const handleMatchEnteringFormSubmit = async (
    data: z.infer<typeof matchEnteringHelperFormSchema>,
  ) => {
    await createMatchEnteringHelper(tournamentId, data);
    router.refresh();
  };

  const handleSetupHelperFormSubmit = async (
    data: z.infer<typeof setupHelperFormSchema>,
  ) => {
    await createSetupHelper(tournamentId, data);
    router.refresh();
  };

  const handleJurorFormSubmit = async () => {
    await createJuror(tournamentId);
    router.refresh();
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
          completed={roles.includes("participant")}
          icon={User}
        >
          <ParticipateForm onSubmit={handleParticipateFormSubmit} />
        </RoleCard>
        <RoleCard
          accordionId="referee"
          name="Schiedsrichter"
          description="Als Schiedsrichter anmelden"
          completed={roles.includes("referee")}
          icon={Shield}
        >
          <RefereeForm onSubmit={handleRefereeFormSubmit} />
        </RoleCard>
        <RoleCard
          accordionId="matchEnteringHelper"
          name="Eingabehelfer"
          description="Als Eingabehelfer anmelden"
          completed={roles.includes("matchEnteringHelper")}
          icon={ClipboardEdit}
        >
          <MatchEnteringForm onSubmit={handleMatchEnteringFormSubmit} />
        </RoleCard>
        <RoleCard
          accordionId="setupHelper"
          name="Aufbauhelfer"
          description="Als Aufbauhelfer anmelden"
          completed={roles.includes("setupHelper")}
          icon={Wrench}
        >
          <SetupHelperForm onSubmit={handleSetupHelperFormSubmit} />
        </RoleCard>
        <RoleCard
          accordionId="juror"
          name="Turniergericht"
          description="Am Turniergericht teilnehmen"
          completed={roles.includes("juror")}
          icon={Gavel}
        >
          <JurorForm onSubmit={handleJurorFormSubmit} />
        </RoleCard>
      </Accordion>
      {roles.length > 0 ? (
        <div className="flex justify-center pt-6">
          <Button size="lg" className="w-full sm:w-auto">
            Rollen-Auswahl abschließen
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

function getAccordionValue(roles: Role[]): RolesWithoutAdmin | undefined {
  for (const role of ROLES) {
    if (!roles.includes(role)) {
      return role;
    }
  }
}
