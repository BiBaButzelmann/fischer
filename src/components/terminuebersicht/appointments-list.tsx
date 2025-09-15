import { Calendar } from "lucide-react";
import { MatchdayAppointment } from "@/services/appointment";
import { MatchdayAppointmentCard } from "./appointment-card";

type Props = {
  appointments: MatchdayAppointment[];
};

export function AppointmentsList({ appointments }: Props) {
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
    <div className="space-y-6">
      {appointments.map((appointment) => (
        <MatchdayAppointmentCard
          key={appointment.matchdayId}
          appointment={appointment}
        />
      ))}
    </div>
  );
}
