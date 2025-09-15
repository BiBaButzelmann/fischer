"use client";

import { Badge } from "@/components/ui/badge";
import { Gavel } from "lucide-react";

type Props = {
  isCanceled: boolean;
};

export function RefereeAppointmentSection({ isCanceled }: Props) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 p-2 rounded-full bg-primary/10">
            <Gavel className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Schiedsrichter</h3>
            <p className="text-sm text-muted-foreground">
              Als Schiedsrichter eingeteilt
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isCanceled && <Badge variant="destructive">Abgesagt</Badge>}
        </div>
      </div>
    </div>
  );
}
