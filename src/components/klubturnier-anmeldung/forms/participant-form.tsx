"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Button } from "../../ui/button";
import { Calendar } from "../../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { participantFormSchema } from "@/schema/participant";
import { MatchDaysCheckboxes } from "./matchday-selection";
import { Info, User, Users } from "lucide-react";
import { CountryDropdown } from "@/components/ui/country-dropdown";
import { cn } from "@/lib/utils";
import { isHoliday } from "@/lib/holidays";

import { Tournament } from "@/db/types/tournament";
import { getParticipantEloData } from "@/actions/participant";
import { Profile } from "@/db/types/profile";
import { DEFAULT_CLUB_KEY, DEFAULT_CLUB_LABEL } from "@/constants/constants";

type Props = {
  initialValues?: z.infer<typeof participantFormSchema>;
  onSubmit: (data: z.infer<typeof participantFormSchema>) => Promise<void>;
  onDelete: () => Promise<void>;
  tournament: Tournament;
  profile: Profile;
};

export function ParticipateForm({
  initialValues,
  onSubmit,
  onDelete,
  tournament,
  profile,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof participantFormSchema>>({
    resolver: zodResolver(participantFormSchema),
    defaultValues: {
      chessClubType: initialValues?.chessClubType,
      chessClub: initialValues?.chessClub,
      title: initialValues?.title,
      dwzRating: initialValues?.dwzRating,
      fideRating: initialValues?.fideRating,
      fideId: initialValues?.fideId,
      nationality: initialValues?.nationality,
      birthYear: initialValues?.birthYear,
      zpsClub: initialValues?.zpsClub,
      zpsPlayer: initialValues?.zpsPlayer,
      preferredMatchDay: initialValues?.preferredMatchDay,
      secondaryMatchDays: initialValues?.secondaryMatchDays ?? [],
      notAvailableDays: initialValues?.notAvailableDays ?? [],
    },
  });

  const fideRating = form.watch("fideRating");
  const chessClubType = form.watch("chessClubType");
  const preferredMatchDay = form.watch("preferredMatchDay");

  const handleDateDisabled = (date: Date) => {
    return isDateDisabled(date, tournament.startDate, tournament.endDate);
  };

  const handleChessClubTypeChange = (value: "hsk" | "other") => {
    form.setValue("chessClubType", value);

    if (value === "other") {
      form.setValue("chessClub", "");
      return;
    }

    startTransition(async () => {
      const eloData = await getParticipantEloData(
        profile.firstName,
        profile.lastName,
      );
      if (!eloData) {
        console.warn(
          `No Elo data found for ${profile.firstName} ${profile.lastName}`,
        );
        return;
      }

      form.setValue("title", eloData.title ?? "noTitle");
      form.setValue("nationality", eloData.nationality ?? undefined);
      form.setValue("fideRating", eloData.fideRating ?? undefined);
      form.setValue("dwzRating", eloData.dwzRating ?? undefined);
      form.setValue("fideId", eloData.fideId ?? undefined);
      form.setValue("zpsClub", eloData.zpsClub ?? undefined);
      form.setValue("zpsPlayer", eloData.zpsPlayer ?? undefined);
    });
  };

  const handleSubmit = (data: z.infer<typeof participantFormSchema>) => {
    console.log("Submitting form with data:", data);
    startTransition(async () => {
      await onSubmit(data);
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await onDelete();
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 pt-4"
      >
        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="chessClubType"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel required>Schachverein</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={handleChessClubTypeChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Schachverein wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={DEFAULT_CLUB_KEY}>
                        {DEFAULT_CLUB_LABEL}
                      </SelectItem>
                      <SelectItem value="other">Anderer Verein</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {chessClubType === "other" && (
          <FormField
            control={form.control}
            name="chessClub"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Name des Schachvereins</FormLabel>
                <FormControl>
                  <Input
                    id="chessClub"
                    placeholder="Bitte gib den Namen deines Schachvereins ein"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
                <FormDescription>
                  Als Mitglied in einem anderen Schachverein wird eine
                  Startgebühr von 60€ fällig. Weitere Informationen folgen nach
                  Anmeldung per E-Mail.
                </FormDescription>
              </FormItem>
            )}
          />
        )}

        {chessClubType != null ? (
          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="w-32">
                  <FormLabel>Titel</FormLabel>
                  <FormControl>
                    <Select
                      defaultValue="noTitle"
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Titel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="noTitle">Kein Titel</SelectItem>
                        <SelectItem value="GM">GM </SelectItem>
                        <SelectItem value="IM">IM </SelectItem>
                        <SelectItem value="FM">FM </SelectItem>
                        <SelectItem value="CM">CM </SelectItem>
                        <SelectItem value="WGM">WGM </SelectItem>
                        <SelectItem value="WIM">WIM </SelectItem>
                        <SelectItem value="WFM">WFM </SelectItem>
                        <SelectItem value="WCM">WCM </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dwzRating"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>DWZ</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      id="dwzRating"
                      placeholder="leer lassen, wenn keine vorhanden"
                      min="500"
                      max="2800"
                      step="1"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fideRating"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel required={fideRating ? true : false}>
                    Elo
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      id="fideRating"
                      placeholder="leer lassen, wenn keine vorhanden"
                      min="500"
                      max="2800"
                      step="1"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>
                    Wer in den A- und B-Gruppen spielen möchte, muss seine Elo
                    angeben.
                  </FormDescription>
                </FormItem>
              )}
            />
          </div>
        ) : null}

        {fideRating ? (
          <div className="flex gap-4">
            {/* FIDE-ID */}
            <FormField
              control={form.control}
              name="fideId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>FIDE ID</FormLabel>
                  <FormControl>
                    <Input id="fideId" placeholder="10245154" {...field} />
                  </FormControl>
                  <FormDescription>
                    <a
                      href="https://ratings.fide.com/profile/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 transition-colors text-blue-400 text-xs"
                    >
                      Was ist die FIDE ID?
                    </a>{" "}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Nationalität */}{" "}
            <FormField
              control={form.control}
              name="nationality"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormLabel required>Nationalität</FormLabel>
                  <FormControl>
                    <CountryDropdown
                      defaultValue={field.value || undefined}
                      onChange={(c) => field.onChange(c.ioc)}
                      placeholder="Land wählen"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="birthYear"
              render={({ field }) => (
                <FormItem className="w-32">
                  <FormLabel required>Geburtsjahr</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      id="birthYear"
                      placeholder="z.B. 1990"
                      min="1900"
                      max={new Date().getFullYear()}
                      step="1"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ) : null}
        <FormField
          control={form.control}
          name="preferredMatchDay"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Bevorzugter Wochentag</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wähle einen Wochentag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tuesday">Dienstag</SelectItem>
                    <SelectItem value="thursday">Donnerstag</SelectItem>
                    <SelectItem value="friday">Freitag</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                Die A-Klasse spielt nur an Freitagen
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="secondaryMatchDays"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ich könnte aber auch spielen am</FormLabel>
              <FormControl>
                <MatchDaysCheckboxes
                  value={field.value}
                  onChange={field.onChange}
                  preferredMatchDay={preferredMatchDay}
                />
              </FormControl>
              <FormMessage />
              <FormDescription>
                Wer nicht flexibel ist, könnte unter Umständen bei dem Turnier
                nicht berücksichtigt werden.
              </FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notAvailableDays"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nicht verfügbare Tage</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      (!field.value || field.value.length === 0) &&
                        "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                    {field.value && field.value.length > 0 ? (
                      `${field.value.length} Tag${field.value.length === 1 ? "" : "e"} ausgewählt`
                    ) : (
                      <span>
                        Einzelne Tage wählen, an denen du nicht verfügbar bist.
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="multiple"
                    selected={field.value || []}
                    onSelect={(selectedDates) => {
                      if (selectedDates && selectedDates.length <= 5) {
                        field.onChange(selectedDates);
                      }
                    }}
                    numberOfMonths={1}
                    disabled={handleDateDisabled}
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Optional: Wähle einzelne Tage aus, an denen du nicht für Spiele
                verfügbar bist, obwohl du sie als bevorzugter Wochentag
                angegeben hast. Verwende dies nur für lang geplante
                Urlaubsreisen oder andere unverschiebbare Termine. Wir versuchen
                dann, dich mit anderen Spielern zu paaren, die an dem Tag
                ebenfalls nicht spielen können, um die Anzahl der Verschiebungen
                zu minimieren.
              </FormDescription>
              <FormMessage />
              {field.value && field.value.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-2">
                    Ausgewählte Tage ({field.value.length}):
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {field.value.map((date, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs"
                      >
                        {format(date, "dd.MM.yyyy")}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </FormItem>
          )}
        />

        <div className="flex items-center gap-2">
          <Button
            disabled={isPending}
            type="submit"
            className="w-full sm:w-auto"
          >
            Änderungen speichern
          </Button>
          {initialValues !== undefined ? (
            <Button
              disabled={isPending}
              className="w-full sm:w-auto "
              variant={"outline"}
              onClick={handleDelete}
            >
              Änderungen verwerfen
            </Button>
          ) : null}
        </div>
      </form>
    </Form>
  );
}

function isDateDisabled(date: Date, min: Date, max: Date) {
  const dateOnly = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const startDateOnly = new Date(
    min.getFullYear(),
    min.getMonth(),
    min.getDate(),
  );
  const endDateOnly = new Date(
    max.getFullYear(),
    max.getMonth(),
    max.getDate(),
  );

  if (dateOnly < startDateOnly || dateOnly > endDateOnly) {
    return true;
  }

  if (isHoliday(date)) {
    return true;
  }

  const dayOfWeek = date.getDay();
  return dayOfWeek !== 2 && dayOfWeek !== 4 && dayOfWeek !== 5;
}
