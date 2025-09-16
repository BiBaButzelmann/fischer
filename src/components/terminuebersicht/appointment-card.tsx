"use client";

import { useTransition, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Clock, ChevronRight, X, Undo2 } from "lucide-react";
import { formatEventDateTime, toLocalDateTime } from "@/lib/date";
import { getDateTimeFromTournamentTime } from "@/lib/game-time";
import { buildGameViewUrl } from "@/lib/navigation";
import Link from "next/link";
import { PrintGamesButton } from "@/components/partien/print-games-button";
import { MatchdayAppointment } from "@/services/appointment";
import {
  cancelMatchdayAppointments,
  uncancelMatchdayAppointments,
} from "@/actions/appointment";
import { toast } from "sonner";
import { RefereeAppointmentSection } from "./referee-appointment-section";
import { SetupHelperAppointmentSection } from "./setup-helper-appointment-section";

type Props = {
  appointment: MatchdayAppointment;
};
export function MatchdayAppointmentCard({ appointment }: Props) {
  const [isPending, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { matchdayId, matchdayDate, tournamentId, gameStartTime, cancelledAt, appointments } =
    appointment;

  const gameUrl = buildGameViewUrl({
    tournamentId,
    matchdayId,
  });

  const isCancelled = cancelledAt !== null;
  const hasActiveAppointments = !isCancelled;

  const appointmentDateTime = getDateTimeFromTournamentTime(matchdayDate, gameStartTime);

  const handleCancel = () => {
    startTransition(async () => {
      try {
        await cancelMatchdayAppointments(matchdayId);
        toast.success("Termine erfolgreich abgesagt");
        setIsDialogOpen(false);
      } catch {
        toast.error("Fehler beim Absagen der Termine");
      }
    });
  };

  const handleUncancel = () => {
    startTransition(async () => {
      try {
        await uncancelMatchdayAppointments(matchdayId);
        toast.success("Absagen erfolgreich rückgängig gemacht");
      } catch {
        toast.error("Fehler beim Rückgängigmachen der Absagen");
      }
    });
  };

  return (
    <Card className="transition-all">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {toLocalDateTime(matchdayDate).setLocale("de").weekdayLong}
          </h2>
          <div className="flex items-center gap-2">
            <Link href={gameUrl}>
              <Button variant="outline" className="group">
                Zu den Partien
                <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <PrintGamesButton
              tournamentId={tournamentId}
              matchdayId={matchdayId}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
          <Clock className="w-4 h-4" />
          <span>{formatEventDateTime(appointmentDateTime)}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {appointments.map((appointmentType, index) => {
          if (appointmentType.type === "referee") {
            return (
              <RefereeAppointmentSection
                key={`referee-${index}`}
                isCanceled={isCancelled}
              />
            );
          }
          return (
            <SetupHelperAppointmentSection
              key={`setupHelper-${index}`}
              otherSetupHelpers={appointmentType.otherSetupHelpers}
              isCanceled={isCancelled}
            />
          );
        })}

        {appointments.length > 0 && (
          <div className="flex justify-center pt-4 border-t">
            {hasActiveAppointments ? (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Termin absagen
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Termin absagen</DialogTitle>
                    <DialogDescription>
                      Möchtest du deine Termine für diesen Spieltag absagen? Das
                      Orga-Team wird automatisch benachrichtigt.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      disabled={isPending}
                    >
                      Abbrechen
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleCancel}
                      disabled={isPending}
                      className="flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Termine absagen
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : isCancelled ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleUncancel}
                disabled={isPending}
                className="flex items-center gap-2"
              >
                <Undo2 className="w-4 h-4" />
                Absagen rückgängig machen
              </Button>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
