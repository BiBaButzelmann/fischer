"use client";

import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { CheckCircle2, LucideIcon } from "lucide-react";
import React, { PropsWithChildren } from "react";

export function RoleCard({
  accordionId,
  name,
  description,
  completed,
  icon,
  children,
}: PropsWithChildren<{
  accordionId: string;
  name: string;
  description: string;
  completed: boolean;
  icon: LucideIcon;
}>) {
  const Icon = icon;

  return (
    <AccordionItem
      value={accordionId}
      className="border-b bg-white dark:bg-gray-900 rounded-lg mb-2 shadow-sm"
    >
      <AccordionTrigger
        className={`p-4 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 no-underline hover:no-underline ${
          completed ? "bg-green-50/50 dark:bg-green-950/20" : ""
        }`}
      >
        <div className="flex items-center gap-4 flex-1">
          <Icon
            className={`h-6 w-6 ${completed ? "text-green-600" : "text-primary"}`}
          />
          <div className="text-left">
            <p className="font-semibold">{name}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        {completed && (
          <span className="ml-4 flex-shrink-0">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </span>
        )}
      </AccordionTrigger>
      <AccordionContent className="md:p-4 md:pt-0">{children}</AccordionContent>
    </AccordionItem>
  );
}
