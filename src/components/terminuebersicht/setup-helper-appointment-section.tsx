"use client";

import { Badge } from "@/components/ui/badge";
import { Wrench, Users, Phone, Mail } from "lucide-react";
import { SetupHelperAppointment } from "@/services/appointment";

type Props = {
  appointment: SetupHelperAppointment;
};

export function SetupHelperAppointmentSection({ appointment }: Props) {
  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 p-2 rounded-full bg-gray-100">
            <Wrench className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Aufbauhelfer</h3>
            <p className="text-sm text-gray-700">
              Du hilfst beim Aufbau (Anreise ca. 30min vor Spielbeginn)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {appointment.isCanceled && (
            <Badge variant="destructive">Abgesagt</Badge>
          )}
        </div>
      </div>

      {appointment.otherSetupHelpers.length > 0 && (
        <div className="space-y-2 mb-4">
          <h4 className="font-medium text-sm text-gray-800 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Weitere Aufbauhelfer:
          </h4>
          <div className="space-y-2">
            {appointment.otherSetupHelpers.map((helper, index) => (
              <div key={index} className="p-2 bg-gray-100 rounded text-sm">
                <div className="font-medium flex items-center gap-2 text-gray-900">
                  {helper.firstName} {helper.lastName}
                  {helper.canceled && (
                    <Badge variant="destructive" className="text-xs">
                      Abgesagt
                    </Badge>
                  )}
                </div>
                <div className="space-y-1 text-xs text-gray-700 mt-1">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    <span>{helper.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3" />
                    <span>{helper.phoneNumber}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
