"use client";

import { useState } from "react";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import type { Role, RoleInfo } from "@/lib/types";
import { User, Shield, Wrench, ClipboardEdit, Gavel } from "lucide-react";
import { RoleCard } from "./role-card";
import { ParticipateForm } from "./forms/participate-form";
import { RefereeForm } from "./forms/referee-form";
import { MatchEnteringForm } from "./forms/match-entering-form";
import { SetupHelperForm } from "./forms/setup-helper-form";
import { JurorForm } from "./forms/juror-form";

const rolesData: RoleInfo[] = [
  {
    id: "spieler",
    name: "Spieler",
    description: "Zum Klubturnier anmelden",
    icon: User,
  },
  {
    id: "schiedsrichter",
    name: "Schiedsrichter",
    description: "Als Schiedsrichter anmelden",
    icon: Shield,
  },
  {
    id: "aufbauhelfer",
    name: "Aufbauhelfer",
    description: "Als Aufbauhelfer anmelden",
    icon: Wrench,
  },
  {
    id: "eingabehelfer",
    name: "Eingabehelfer",
    description: "Als Eingabehelfer anmelden",
    icon: ClipboardEdit,
  },
  {
    id: "turniergericht",
    name: "Turniergericht",
    description: "Am Turniergericht teilnehmen",
    icon: Gavel,
  },
];

export function RolesManager() {
  const [submittedData, setSubmittedData] = useState<Record<string, any>>({});
  const [accordionValue, setAccordionValue] = useState<string | undefined>();

  const isAnyRoleCompleted = Object.keys(submittedData).length > 0;

  return (
    <div className="space-y-6">
      <Accordion
        type="single"
        collapsible
        value={accordionValue}
        onValueChange={setAccordionValue}
        className="w-full"
      >
        <RoleCard
          accordionId="participant"
          name="Spieler"
          description="Zum Klubturnier anmelden"
          completed={false}
          icon={User}
        >
          {/* TODO: dynamic tournament id */}
          <ParticipateForm tournamentId={1} />
        </RoleCard>
        <RoleCard
          accordionId="referee"
          name="Schiedsrichter"
          description="Als Schiedsrichter anmelden"
          completed={false}
          icon={Shield}
        >
          <RefereeForm tournamentId={1} />
        </RoleCard>
        <RoleCard
          accordionId="matchEnteringHelper"
          name="Eingabehelfer"
          description="Als Eingabehelfer anmelden"
          completed={false}
          icon={ClipboardEdit}
        >
          <MatchEnteringForm tournamentId={1} />
        </RoleCard>
        <RoleCard
          accordionId="setupHelper"
          name="Aufbauhelfer"
          description="Als Aufbauhelfer anmelden"
          completed={false}
          icon={Wrench}
        >
          <SetupHelperForm tournamentId={1} />
        </RoleCard>
        <RoleCard
          accordionId="jury"
          name="Turniergericht"
          description="Am Turniergericht teilnehmen"
          completed={false}
          icon={Gavel}
        >
          <JurorForm tournamentId={1} />
        </RoleCard>
      </Accordion>

      {isAnyRoleCompleted && (
        <div className="flex justify-center pt-6">
          <Button size="lg" className="w-full sm:w-auto">
            Rollen-Auswahl abschließen
          </Button>
        </div>
      )}
    </div>
  );
}
