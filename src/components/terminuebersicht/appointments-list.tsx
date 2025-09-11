import { Calendar } from "lucide-react";
import {
  RefereeAppointment,
  SetupHelperAppointment,
} from "@/services/appointment";
import { MatchdayAppointmentCard } from "./appointment-card";

type MatchdayAppointment = {
  refereeAppointment?: RefereeAppointment;
  setupHelperAppointment?: SetupHelperAppointment;
};

type Props = {
  refereeAppointments: RefereeAppointment[];
  setupHelperAppointments: SetupHelperAppointment[];
};

export function TerminuebersichtAppointmentsList({
  refereeAppointments,
  setupHelperAppointments,
}: Props) {
  const appointmentsByMatchday = new Map<number, MatchdayAppointment>();

  for (const appointment of refereeAppointments) {
    appointmentsByMatchday.set(appointment.matchdayId, {
      refereeAppointment: appointment,
    });
  }

  for (const appointment of setupHelperAppointments) {
    const existing = appointmentsByMatchday.get(appointment.matchdayId);
    if (existing) {
      existing.setupHelperAppointment = appointment;
    } else {
      appointmentsByMatchday.set(appointment.matchdayId, {
        setupHelperAppointment: appointment,
      });
    }
  }

  const appointments = Array.from(appointmentsByMatchday.values()).sort(
    (a, b) => {
      const dateA = (a.refereeAppointment || a.setupHelperAppointment)!.date;
      const dateB = (b.refereeAppointment || b.setupHelperAppointment)!.date;
      return dateA.getTime() - dateB.getTime();
    },
  );

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
          key={
            (appointment.refereeAppointment ||
              appointment.setupHelperAppointment)!.matchdayId
          }
          refereeAppointment={appointment.refereeAppointment}
          setupHelperAppointment={appointment.setupHelperAppointment}
        />
      ))}
    </div>
  );
}
