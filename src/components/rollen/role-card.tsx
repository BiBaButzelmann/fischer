"use client";

import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { CheckCircle2 } from "lucide-react";
import type { RoleInfo } from "@/lib/types";
import { AvailabilityForm } from "../role-forms/availability-form";
import { PlayerForm } from "../role-forms/player-form";
import { DataEntryForm } from "../role-forms/data-entry-form";
import { JuryForm } from "../role-forms/jury-form";

interface RoleCardProps {
  role: RoleInfo;
  isCompleted: boolean;
  initialData: any;
  onSubmit: (data: any) => void;
}

export function RoleCard({
  role,
  isCompleted,
  initialData,
  onSubmit,
}: RoleCardProps) {
  const IconComponent = role.icon;

  const renderForm = () => {
    switch (role.id) {
      case "spieler":
        return <PlayerForm onSubmit={onSubmit} initialData={initialData} />;
      case "schiedsrichter":
      case "aufbauhelfer":
        return (
          <AvailabilityForm onSubmit={onSubmit} initialData={initialData} />
        );
      case "eingabehelfer":
        return <DataEntryForm onSubmit={onSubmit} initialData={initialData} />;
      case "turniergericht":
        return <JuryForm onSubmit={onSubmit} initialData={initialData} />;
      default:
        return null;
    }
  };

  return (
    <AccordionItem
      value={role.id}
      className="border-b bg-white dark:bg-gray-900 rounded-lg mb-2 shadow-sm"
    >
      <AccordionTrigger
        className={`p-4 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 no-underline hover:no-underline ${
          isCompleted ? "bg-green-50/50 dark:bg-green-950/20" : ""
        }`}
      >
        <div className="flex items-center gap-4 flex-1">
          <IconComponent
            className={`h-6 w-6 ${isCompleted ? "text-green-600" : "text-primary"}`}
          />
          <div className="text-left">
            <p className="font-semibold">{role.name}</p>
            <p className="text-sm text-muted-foreground">{role.description}</p>
          </div>
        </div>
        {isCompleted && (
          <span className="ml-4 flex-shrink-0">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </span>
        )}
      </AccordionTrigger>
      <AccordionContent className="p-4 pt-0">{renderForm()}</AccordionContent>
    </AccordionItem>
  );
}
