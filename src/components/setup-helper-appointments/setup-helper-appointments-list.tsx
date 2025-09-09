import { SetupHelperAppointmentCard } from "./setup-helper-appointment-card";
import { Wrench } from "lucide-react";

type ContactDetails = {
  otherSetupHelpers: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  }[];
  referee: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  } | null;
};

type Appointment = {
  matchdayId: number;
  date: Date;
  dayOfWeek: string;
  tournamentId: number;
  canceled: boolean | null;
  contactDetails: ContactDetails;
};

type Props = {
  appointments: Appointment[];
};

export function SetupHelperAppointmentsList({ appointments }: Props) {
  if (appointments.length === 0) {
    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="pt-6 pb-6 px-6 text-center text-muted-foreground">
          <Wrench className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Keine anstehenden Aufbauhelfer-Termine</p>
          <p className="mt-2">
            Du hast aktuell keine Termine als Aufbauhelfer zugewiesen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <SetupHelperAppointmentCard
          key={appointment.matchdayId}
          appointment={appointment}
        />
      ))}
    </div>
  );
}
