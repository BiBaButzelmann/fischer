"use client";

import { useEffect, useState, useTransition } from "react";
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
import {
  getGameContacts,
  updateGameMatchdayAndBoardNumber,
} from "@/actions/game";
import { MatchDay } from "@/db/types/match-day";
import { GameContactPerson, GameContacts } from "@/db/types/game";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { isError } from "@/lib/actions";
import { Card, CardContent } from "../ui/card";
import { Mail, Phone } from "lucide-react";
import {
  toLocalDateTime,
  formatDate,
  toDateOnly,
  utcDateToDateOnly,
} from "@/lib/date";
import { DateTime } from "luxon";

type Props = {
  gameId: number;
  availableMatchdays: MatchDay[];
  currentGameDate: DateTime;
  whiteName: string;
  blackName: string;
};

export function PostponeGameDialog({
  gameId,
  availableMatchdays,
  currentGameDate,
  whiteName,
  blackName,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isOpen, setIsOpen] = useState(false);
  const [contacts, setContacts] = useState<GameContacts | null>(null);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);

  useEffect(() => {
    if (!isOpen || contacts != null) {
      return;
    }

    let cancelled = false;
    setIsLoadingContacts(true);
    getGameContacts(gameId)
      .then((data) => {
        if (!cancelled) {
          setContacts(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error("Kontaktdaten konnten nicht geladen werden.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingContacts(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, contacts, gameId]);

  const handlePostponeFormSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!selectedDate) return;

    const selectedMatchday = availableMatchdays.find(
      (matchday) => matchday.date === utcDateToDateOnly(selectedDate),
    );

    if (!selectedMatchday) return;

    startTransition(async () => {
      try {
        const result = await updateGameMatchdayAndBoardNumber(
          gameId,
          selectedMatchday.id,
        );
        if (isError(result)) {
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

  const isDateDisabled = (date: Date) => {
    const day = utcDateToDateOnly(date);
    if (day === toDateOnly(currentGameDate)) {
      return true;
    }

    return !availableMatchdays.some((matchday) => matchday.date === day);
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
            <ContactCard
              name={whiteName}
              contact={contacts?.white}
              isLoading={isLoadingContacts}
            />
            <ContactCard
              name={blackName}
              contact={contacts?.black}
              isLoading={isLoadingContacts}
            />
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
                    formatDate(toLocalDateTime(selectedDate))
                  ) : (
                    <span>Datum wählen</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  timeZone="UTC"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={isDateDisabled}
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

function ContactCard({
  name,
  contact,
  isLoading,
}: {
  name: string;
  contact: GameContactPerson | null | undefined;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardContent className="space-y-2 pt-6">
        <h3 className="text-base">{name}</h3>
        {contact ? (
          <>
            {contact.email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3 w-3" />
                {contact.email}
              </div>
            )}
            {contact.phoneNumber && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-3 w-3" />
                {contact.phoneNumber}
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Kontaktdaten werden geladen…" : ""}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
