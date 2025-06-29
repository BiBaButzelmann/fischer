"use client";

import { useState } from "react";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import type { Role, RoleInfo } from "@/lib/types";
import { User, Shield, Wrench, ClipboardEdit, Gavel } from "lucide-react";
import { RoleCard } from "./role-card";

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

  const handleRoleSubmit = (roleId: Role, data: any) => {
    console.log("Submitted data for", roleId, data);
    setSubmittedData((prev) => ({ ...prev, [roleId]: data }));
    setAccordionValue(undefined); // Collapse the accordion item after submit
  };

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
        {rolesData.map((role) => (
          <RoleCard
            key={role.id}
            role={role}
            isCompleted={!!submittedData[role.id]}
            initialData={submittedData[role.id]}
            onSubmit={(data: any) => handleRoleSubmit(role.id, data)}
          />
        ))}
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
