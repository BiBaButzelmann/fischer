"use client";

import { useTransition } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, X, Undo2, ChevronRight, Wrench } from "lucide-react";
import { formatEventDateTime, toLocalDateTime } from "@/lib/date";
import { getSetupHelperTimeFromDefaultTime } from "@/lib/game-time";
import { matchDays } from "@/constants/constants";
import { buildGameViewUrl } from "@/lib/navigation";
import Link from "next/link";
import {
  cancelSetupHelperAppointment,
  uncancelSetupHelperAppointment,
} from "@/actions/setup-helper-appointments";
import { toast } from "sonner";
import { ContactsList } from "./contacts-list";
import { PrintGamesButton } from "@/components/partien/print-games-button";

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
  appointment: Appointment;
};

export function SetupHelperAppointmentCard({ appointment }: Props) {
  const [isPending, startTransition] = useTransition();

  const setupTime = getSetupHelperTimeFromDefaultTime(appointment.date);
  const isCanceled = appointment.canceled === true;

  const handleCancel = () => {
    startTransition(async () => {
      try {
        await cancelSetupHelperAppointment(appointment.matchdayId);
        toast.success("Termin erfolgreich abgesagt");
      } catch {
        toast.error("Fehler beim Absagen des Termins");
      }
    });
  };

  const handleUncancel = () => {
    startTransition(async () => {
      try {
        await uncancelSetupHelperAppointment(appointment.matchdayId);
        toast.success("Absage erfolgreich rückgängig gemacht");
      } catch {
        toast.error("Fehler beim Rückgängigmachen der Absage");
      }
    });
  };

  const gameUrl = buildGameViewUrl({
    tournamentId: appointment.tournamentId,
    matchdayId: appointment.matchdayId,
  });

  return (
    <Card className="transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 p-3 rounded-full bg-green-100">
              <Wrench className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg">
                {matchDays[appointment.dayOfWeek as keyof typeof matchDays]}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>
                  {formatEventDateTime(toLocalDateTime(setupTime.toJSDate()))}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isCanceled && <Badge variant="destructive">Abgesagt</Badge>}
            <Link href={gameUrl}>
              <Button variant="outline" className="group">
                Zu den Partien
                <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <PrintGamesButton
              tournamentId={appointment.tournamentId}
              matchdayId={appointment.matchdayId}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-4">
          <ContactsList details={appointment.contactDetails} />
        </div>

        <div className="flex justify-center pt-2">
          {!isCanceled ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleCancel}
              disabled={isPending}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Absagen
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleUncancel}
              disabled={isPending}
              className="flex items-center gap-2"
            >
              <Undo2 className="w-4 h-4" />
              Absage rückgängig machen
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
