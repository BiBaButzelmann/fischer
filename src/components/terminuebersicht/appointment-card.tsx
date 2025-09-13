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
import { getSetupHelperTimeFromDefaultTime } from "@/lib/game-time";
import { buildGameViewUrl } from "@/lib/navigation";
import Link from "next/link";
import { PrintGamesButton } from "@/components/partien/print-games-button";
import { MatchdayAppointment } from "@/services/appointment";
import {
  cancelRefereeAppointment,
  uncancelRefereeAppointment,
  cancelSetupHelperAppointment,
  uncancelSetupHelperAppointment,
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

  const baseAppointment =
    appointment.refereeAppointment ?? appointment.setupHelperAppointment;
  if (!baseAppointment) return null;

  const { matchdayId, date, tournamentId } = baseAppointment;

  const setupHelperTime = getSetupHelperTimeFromDefaultTime(date);

  const gameUrl = buildGameViewUrl({
    tournamentId,
    matchdayId,
  });

  const hasAnyAppointment =
    appointment.refereeAppointment || appointment.setupHelperAppointment;
  const hasAnyCancelledAppointment =
    appointment.refereeAppointment?.isCanceled ||
    appointment.setupHelperAppointment?.isCanceled;
  const hasAnyActiveAppointment =
    (appointment.refereeAppointment &&
      !appointment.refereeAppointment.isCanceled) ||
    (appointment.setupHelperAppointment &&
      !appointment.setupHelperAppointment.isCanceled);

  const handleCancel = () => {
    startTransition(async () => {
      try {
        const promises = [];

        if (
          appointment.refereeAppointment &&
          !appointment.refereeAppointment.isCanceled
        ) {
          promises.push(cancelRefereeAppointment(matchdayId));
        }

        if (
          appointment.setupHelperAppointment &&
          !appointment.setupHelperAppointment.isCanceled
        ) {
          promises.push(cancelSetupHelperAppointment(matchdayId));
        }

        await Promise.all(promises);
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
        const promises = [];

        if (appointment.refereeAppointment?.isCanceled) {
          promises.push(uncancelRefereeAppointment(matchdayId));
        }

        if (appointment.setupHelperAppointment?.isCanceled) {
          promises.push(uncancelSetupHelperAppointment(matchdayId));
        }

        await Promise.all(promises);
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
            {toLocalDateTime(date).setLocale("de").weekdayLong}
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
          <span>
            {formatEventDateTime(toLocalDateTime(setupHelperTime.toJSDate()))}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {appointment.refereeAppointment && (
          <RefereeAppointmentSection
            appointment={appointment.refereeAppointment}
          />
        )}

        {appointment.setupHelperAppointment && (
          <SetupHelperAppointmentSection
            appointment={appointment.setupHelperAppointment}
          />
        )}

        {hasAnyAppointment && (
          <div className="flex justify-center pt-4 border-t">
            {hasAnyActiveAppointment ? (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Termine absagen
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Termine absagen</DialogTitle>
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
            ) : hasAnyCancelledAppointment ? (
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
