import { Calendar } from "lucide-react";
import { Appointment } from "@/types/appointment";
import { TerminuebersichtAppointmentCard } from "./appointment-card";

type Props = {
  appointments: Appointment[];
};

export function TerminuebersichtAppointmentsList({ appointments }: Props) {
  if (appointments.length === 0) {
    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="pt-6 pb-6 px-6 text-center text-muted-foreground">
          <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Keine anstehenden Termine</p>
          <p className="mt-2">
            Du hast aktuell keine Termine als Schiedsrichter oder Aufbauhelfer
            zugewiesen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <TerminuebersichtAppointmentCard
          key={appointment.matchdayId}
          appointment={appointment}
        />
      ))}
    </div>
  );
}
