"use client";

import { Badge } from "@/components/ui/badge";
import { Gavel } from "lucide-react";
import { RefereeAppointment } from "@/services/appointment";

type Props = {
  appointment: RefereeAppointment;
};

export function RefereeAppointmentSection({ appointment }: Props) {
  return (
    <div className="border rounded-lg p-4 bg-red-50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 p-2 rounded-full bg-red-100">
            <Gavel className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-red-900">Schiedsrichter</h3>
            <p className="text-sm text-red-700">
              Du wirst als Schiedsrichter eingeteilt
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {appointment.isCanceled && (
            <Badge variant="destructive">Abgesagt</Badge>
          )}
        </div>
      </div>
    </div>
  );
}
