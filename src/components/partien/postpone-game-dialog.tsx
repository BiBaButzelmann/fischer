"use client";

import { useState, useTransition } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { updateGameMatchdayAndBoardNumber } from "@/actions/game";
import { MatchDay } from "@/db/types/match-day";
import { GameWithParticipantProfilesAndGroupAndMatchday } from "@/db/types/game";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "../ui/card";
import { Mail, Phone } from "lucide-react";
import { isSameDate, toLocalDateTime, toDateString } from "@/lib/date";
import invariant from "tiny-invariant";
import { DateTime } from "luxon";

type Props = {
  gameId: number;
  availableMatchdays: MatchDay[];
  currentGameDate: DateTime;
  game: GameWithParticipantProfilesAndGroupAndMatchday;
};

export function PostponeGameDialog({
  gameId,
  availableMatchdays,
  currentGameDate,
  game,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isOpen, setIsOpen] = useState(false);

  invariant(
    game.whiteParticipant && game.blackParticipant,
    "PostponeGameDialog should only be called with games that have both participants",
  );

  const handlePostponeFormSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!selectedDate) return;

    const selectedMatchday = availableMatchdays.find((matchday) =>
      isSameDate(toLocalDateTime(matchday.date), toLocalDateTime(selectedDate)),
    );

    if (!selectedMatchday) return;

    startTransition(async () => {
      try {
        const result = await updateGameMatchdayAndBoardNumber(
          gameId,
          selectedMatchday.id,
        );
        if (result?.error) {
          toast.error(result.error);
          return;
        }
        toast.success("Partie erfolgreich verschoben!");
        setSelectedDate(undefined);
        setIsOpen(false);
      } catch {
        toast.error("Fehler beim Verschieben der Partie.");
      }
    });
  };

  const isDateDisabled = (date: DateTime) => {
    if (isSameDate(date, currentGameDate)) {
      return true;
    }

    return !availableMatchdays.some((matchday) =>
      isSameDate(toLocalDateTime(matchday.date), date),
    );
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSelectedDate(undefined);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button
              aria-label="Partie verschieben"
              variant="outline"
              size="icon"
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Partie verschieben</p>
        </TooltipContent>
      </Tooltip>
      <DialogContent>
        <form onSubmit={handlePostponeFormSubmit}>
          <DialogHeader>
            <DialogTitle>Partie verschieben</DialogTitle>
            <DialogDescription>
              Sprich dich zuerst mit deinem Gegner ab und trage hier
              anschließend das neue Datum ein.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <Card>
              <CardContent className="space-y-2 pt-6">
                <h3 className="text-base">
                  {game.whiteParticipant.profile.firstName}{" "}
                  {game.whiteParticipant.profile.lastName}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  {game.whiteParticipant.profile.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  {game.whiteParticipant.profile.phoneNumber}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-2 pt-6">
                <h3 className="text-base">
                  {game.blackParticipant.profile.firstName}{" "}
                  {game.blackParticipant.profile.lastName}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  {game.blackParticipant.profile.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  {game.blackParticipant.profile.phoneNumber}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-2 py-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                  {selectedDate ? (
                    toDateString(toLocalDateTime(selectedDate))
                  ) : (
                    <span>Datum wählen</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => isDateDisabled(toLocalDateTime(date))}
                />
              </PopoverContent>
            </Popover>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Schließen</Button>
            </DialogClose>
            <Button disabled={isPending || !selectedDate} type="submit">
              Speichern
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
