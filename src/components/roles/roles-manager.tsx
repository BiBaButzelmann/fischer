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

export function RolesManager({ roles }: { roles: Role[] }) {
  return (
    <div className="space-y-6">
      <Accordion
        type="single"
        collapsible
        // value={accordionValue}
        // onValueChange={setAccordionValue}
        className="w-full"
      >
        <RoleCard
          accordionId="participant"
          name="Spieler"
          description="Zum Klubturnier anmelden"
          completed={roles.includes("participant")}
          icon={User}
        >
          {/* TODO: dynamic tournament id */}
          <ParticipateForm tournamentId={1} />
        </RoleCard>
        <RoleCard
          accordionId="referee"
          name="Schiedsrichter"
          description="Als Schiedsrichter anmelden"
          completed={roles.includes("referee")}
          icon={Shield}
        >
          <RefereeForm tournamentId={1} />
        </RoleCard>
        <RoleCard
          accordionId="matchEnteringHelper"
          name="Eingabehelfer"
          description="Als Eingabehelfer anmelden"
          completed={roles.includes("matchEnteringHelper")}
          icon={ClipboardEdit}
        >
          <MatchEnteringForm tournamentId={1} />
        </RoleCard>
        <RoleCard
          accordionId="setupHelper"
          name="Aufbauhelfer"
          description="Als Aufbauhelfer anmelden"
          completed={roles.includes("setupHelper")}
          icon={Wrench}
        >
          <SetupHelperForm tournamentId={1} />
        </RoleCard>
        <RoleCard
          accordionId="juror"
          name="Turniergericht"
          description="Am Turniergericht teilnehmen"
          completed={roles.includes("juror")}
          icon={Gavel}
        >
          <JurorForm tournamentId={1} />
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

function getAccordionValue(roles: Role[]) {
  return "participant";
}
