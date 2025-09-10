"use client";

import { useTransition } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, X, Undo2, ChevronRight, Wrench, Gavel } from "lucide-react";
import { formatEventDateTime, toLocalDateTime } from "@/lib/date";
import { getSetupHelperTimeFromDefaultTime } from "@/lib/game-time";
import { matchDays } from "@/constants/constants";
import { buildGameViewUrl } from "@/lib/navigation";
import Link from "next/link";
import { cancelAppointment, uncancelAppointment } from "@/actions/appointment";
import { toast } from "sonner";
import { ContactsList } from "./contacts-list";
import { PrintGamesButton } from "@/components/partien/print-games-button";
import { Appointment } from "@/types/appointment";

type Props = {
  appointment: Appointment;
};

export function TerminuebersichtAppointmentCard({ appointment }: Props) {
  const [isPending, startTransition] = useTransition();

  const setupHelperTime = getSetupHelperTimeFromDefaultTime(appointment.date);
  const isCanceled = appointment.isCanceled;

  const { isReferee, isSetupHelper } = appointment.userRoles;

  const handleCancel = () => {
    startTransition(async () => {
      try {
        await cancelAppointment(appointment.matchdayId);
        toast.success("Termin erfolgreich abgesagt");
      } catch {
        toast.error("Fehler beim Absagen des Termins");
      }
    });
  };

  const handleUncancel = () => {
    startTransition(async () => {
      try {
        await uncancelAppointment(appointment.matchdayId);
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
            {isReferee && isSetupHelper ? (
              <div className="flex gap-2">
                <div className="flex-shrink-0 p-2 rounded-full bg-red-100">
                  <Gavel className="w-4 h-4 text-red-600" />
                </div>
                <div className="flex-shrink-0 p-2 rounded-full bg-green-100">
                  <Wrench className="w-4 h-4 text-green-600" />
                </div>
              </div>
            ) : isReferee ? (
              <div className="flex-shrink-0 p-3 rounded-full bg-red-100">
                <Gavel className="w-6 h-6 text-red-600" />
              </div>
            ) : (
              <div className="flex-shrink-0 p-3 rounded-full bg-green-100">
                <Wrench className="w-6 h-6 text-green-600" />
              </div>
            )}
            <div>
              <h3 className="font-bold text-lg">
                {matchDays[appointment.dayOfWeek as keyof typeof matchDays]}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>
                  {formatEventDateTime(
                    toLocalDateTime(setupHelperTime.toJSDate()),
                  )}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {isReferee && isSetupHelper
                  ? "Schiedsrichter & Aufbauhelfer"
                  : isReferee
                    ? "Schiedsrichter"
                    : "Aufbauhelfer"}
              </p>
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

        <div className="space-y-3 pt-2">
          <div className="flex justify-center">
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
          <p className="text-xs text-gray-500 text-center">
            Das Orga-Team wird automatisch über die Absage benachrichtigt
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
