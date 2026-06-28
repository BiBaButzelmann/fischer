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
import { CountryDropdown } from "@/components/ui/country-dropdown";
import { cn } from "@/lib/utils";
import { isHoliday } from "@/lib/holidays";
import { Tournament } from "@/db/types/tournament";
import { getParticipantEloData } from "@/actions/participant";
import { toast } from "sonner";
import { Profile } from "@/db/types/profile";
import {
  CLUBLESS_KEY,
  CLUBLESS_LABEL,
  DEFAULT_CLUB_KEY,
  DEFAULT_CLUB_LABEL,
} from "@/constants/constants";
import { Switch } from "@/components/ui/switch";
import type { PromotionEligibility } from "@/services/promotion";

type Props = {
  initialValues?: z.infer<typeof participantFormSchema>;
  canDelete: boolean;
  promotionEligibility: PromotionEligibility | null;
  onSubmit: (data: z.infer<typeof participantFormSchema>) => Promise<void>;
  onDelete: () => Promise<void>;
  tournament: Tournament;
  profile: Profile;
};

export function ParticipateForm({
  initialValues,
  canDelete,
  promotionEligibility,
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
      gender: initialValues?.gender,
      dwzRating: initialValues?.dwzRating,
      fideRating: initialValues?.fideRating,
      fideId: initialValues?.fideId,
      nationality: initialValues?.nationality,
      birthYear: initialValues?.birthYear,
      birthDate: initialValues?.birthDate,
      zpsClub: initialValues?.zpsClub,
      zpsPlayer: initialValues?.zpsPlayer,
      preferredMatchDay: initialValues?.preferredMatchDay,
      secondaryMatchDays: initialValues?.secondaryMatchDays ?? [],
      notAvailableDays: initialValues?.notAvailableDays ?? [],
      exercisePromotionRight: initialValues?.exercisePromotionRight ?? false,
    },
  });

  const fideRating = form.watch("fideRating");
  const chessClubType = form.watch("chessClubType");
  const preferredMatchDay = form.watch("preferredMatchDay");

  const handleDateDisabled = (date: Date) => {
    return isDateDisabled(date, tournament.startDate, tournament.endDate);
  };

  const handleChessClubTypeChange = (
    value: "hsk" | "other" | "vereinslos",
  ) => {
    form.setValue("chessClubType", value);

    if (value === "other") {
      form.setValue("chessClub", "");
      return;
    }

    if (value === CLUBLESS_KEY) {
      form.setValue("chessClub", "");
      form.setValue("zpsClub", undefined);
      form.setValue("zpsPlayer", undefined);
      return;
    }

    startTransition(async () => {
      try {
        const eloData = await getParticipantEloData(
          profile.firstName,
          profile.lastName,
        );
        if (!eloData) {
          toast.info(
            `Keine Einträge zu ${profile.firstName} ${profile.lastName} im HSK-Verzeichnis gefunden. Bitte trage deine Daten manuell ein.`,
          );
          return;
        }

        form.setValue("title", eloData.title ?? "noTitle");

        if (eloData.gender) {
          form.setValue("gender", eloData.gender);
        }
        if (eloData.dwzRating) {
          form.setValue("dwzRating", eloData.dwzRating);
        }
        if (eloData.birthYear) {
          form.setValue("birthYear", eloData.birthYear);
        }
        if (eloData.zpsClub) {
          form.setValue("zpsClub", eloData.zpsClub);
        }
        if (eloData.zpsPlayer) {
          form.setValue("zpsPlayer", eloData.zpsPlayer);
        }

        if (eloData.fideRating && eloData.fideId) {
          form.setValue("fideRating", eloData.fideRating);
          form.setValue("fideId", eloData.fideId);
          form.setValue(
            "nationality",
            eloData.nationality !== "?" ? eloData.nationality : undefined,
          );
        }

        toast.success("Deine Daten wurden aus der DSB-Datenbank übernommen.");
      } catch {
        toast.error(
          "Daten konnten nicht aus der DSB-Datenbank geladen werden. Bitte trage sie manuell ein.",
        );
      }
    });
  };

  const handleSubmit = (data: z.infer<typeof participantFormSchema>) => {
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
        {promotionEligibility != null ? (
          <FormField
            control={form.control}
            name="exercisePromotionRight"
            render={({ field }) => (
              <FormItem className="space-y-3 rounded-md border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
                <div className="flex flex-row items-center justify-between gap-3 space-y-0">
                  <div className="space-y-1">
                    <FormLabel>
                      Möchtest du dein Aufstiegsrecht wahrnehmen?
                    </FormLabel>
                    <FormDescription>
                      Als Sieger der Gruppe {promotionEligibility.wonGroupName}{" "}
                      hast du das Recht, in die Gruppe{" "}
                      {promotionEligibility.targetTierLetter} aufzusteigen.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </div>
                {promotionEligibility.targetIsAGroup ? (
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                    Beachte: Die A-Gruppe spielt nur freitags.
                  </p>
                ) : null}
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}

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
                      <SelectItem value={CLUBLESS_KEY}>
                        {CLUBLESS_LABEL}
                      </SelectItem>
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

        {chessClubType === CLUBLESS_KEY && (
          <div className="space-y-2">
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem className="w-32">
                    <FormLabel required>Geschlecht</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Geschlecht" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="m">Männlich</SelectItem>
                          <SelectItem value="f">Weiblich</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel required>Geburtsdatum</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        max={format(new Date(), "yyyy-MM-dd")}
                        value={
                          field.value ? format(field.value, "yyyy-MM-dd") : ""
                        }
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? new Date(`${e.target.value}T00:00:00`)
                              : undefined,
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Für vereinslose Spieler benötigt der DSB das exakte Geburtsdatum
              und das Geschlecht für die FIDE- und DWZ-Wertung.
            </p>
          </div>
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
                      value={field.value ?? ""}
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
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>
                    Wer in den A-, B- und C-Gruppen spielen möchte, muss seine
                    Elo angeben.
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
                    <Input
                      id="fideId"
                      placeholder="10245154"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormDescription>
                    <a
                      href="https://www.schachbund.de/fide-identifikationsnummer.html"
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
                      value={field.value ?? ""}
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
              <FormLabel required>Bevorzugter Spieltag</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wähle einen Spieltag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tuesday">Dienstag</SelectItem>
                    <SelectItem value="thursday">Donnerstag</SelectItem>
                    <SelectItem value="friday">Freitag</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                Die A-Gruppe spielt nur an Freitagen
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
                nicht berücksichtigt werden oder landet in einer niedrigeren
                Gruppe.
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
                    selected={field.value ?? []}
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
                verfügbar bist, obwohl du sie als bevorzugter Spieltag angegeben
                hast. Verwende dies nur für lang geplante Urlaubsreisen oder
                andere unverschiebbare Termine. Wir versuchen dann, dich mit
                anderen Spielern zu paaren, die an dem Tag ebenfalls nicht
                spielen können, um die Anzahl der Verschiebungen zu minimieren.
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
          {canDelete && tournament.stage === "registration" ? (
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
