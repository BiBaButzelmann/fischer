"use client";

import { Controller, useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Profile } from "@/db/types/profile";
import { Tournament } from "@/db/types/tournament";
import { TournamentWeekWithMatchdays } from "@/db/types/tournamentWeek";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { EditTournamentWeeks } from "./edit-tournament-weeks/edit-tournament-weeks";
import { updateTournamentFormSchema } from "@/schema/tournament";
import { z } from "zod";
import { DEFAULT_CLUB_LABEL } from "@/constants/constants";
import { updateTournament } from "@/actions/tournament";

type Props = {
  profiles: Profile[];
  tournament?: Tournament;
  tournamentWeeks: TournamentWeekWithMatchdays[];
};
export default function EditTournamentDetails({
  profiles,
  tournament,
  tournamentWeeks,
}: Props) {
  const [loading, startTransition] = useTransition();

  const selectedCalendarWeeks = tournamentWeeks.map((week, index) => ({
    index,
    status: week.status as "regular" | "catch-up",
    weekNumber: week.weekNumber,
    tuesday: {
      refereeNeeded: week.matchdays[0]?.refereeNeeded ?? false,
    },
    thursday: {
      refereeNeeded: week.matchdays[1]?.refereeNeeded ?? false,
    },
    friday: {
      refereeNeeded: week.matchdays[2]?.refereeNeeded ?? false,
    },
  }));

  const form = useForm({
    resolver: zodResolver(updateTournamentFormSchema),
    defaultValues: {
      clubName: tournament?.club ?? DEFAULT_CLUB_LABEL,
      tournamentType: tournament?.type ?? "Rundenturnier",
      numberOfRounds: tournament?.numberOfRounds ?? 9,
      timeLimit:
        tournament?.timeLimit ??
        "40 Züge in 90 Minuten, danach 0 Züge in 0 Minuten, 30 Minuten für die letzte Phase, Zugabe pro Zug in Sekunden: 30",
      location: tournament?.location ?? "Hamburg",
      tieBreakMethod: tournament?.tieBreakMethod ?? "Sonneborn-Berger",
      softwareUsed: tournament?.softwareUsed ?? "Swiss Manager",
      allClocksDigital: tournament?.allClocksDigital ?? true,
      phone: tournament?.phone ?? "040 20981411",
      email: tournament?.email ?? "klubturnier@hsk1830.de",
      startDate: tournament?.startDate
        ? tournament.startDate.toISOString().split("T")[0]
        : "",
      endDate: tournament?.endDate
        ? tournament.endDate.toISOString().split("T")[0]
        : "",
      endRegistrationDate: tournament?.endRegistrationDate
        ? tournament.endRegistrationDate.toISOString().split("T")[0]
        : "",
      organizerProfileId: tournament?.organizerProfileId?.toString() ?? "",
      selectedCalendarWeeks,
      pgnViewerPassword: "",
    },
  });

  const handleSubmit = async (
    data: z.infer<typeof updateTournamentFormSchema>,
  ) => {
    if (!tournament?.id) {
      console.error("No tournament ID available for update");
      return;
    }

    startTransition(async () => {
      await updateTournament(tournament.id, data);
    });
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Teil 1: Turnierinformationen */}
          <span className="text-xl font-semibold text-gray-800">
            Turnierinformationen
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="clubName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Vereinsname</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Vereinsname" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tournamentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Turnierart</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="z.B. Schweizer System, Rundenturnier"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="numberOfRounds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Anzahl Runden</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Anzahl der Runden eingeben"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timeLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Bedenkzeit</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="z.B. 90 Minuten + 30 Sekunden Zuschlag"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Controller
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Startdatum</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Controller
              control={form.control}
              name="endRegistrationDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Ende der Registrierungsphase</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Controller
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Enddatum</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Austragungsort</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Adresse des Turnierortes eingeben"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="tieBreakMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Feinwertung</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="z.B. Buchholz, Sonneborn-Berger"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="softwareUsed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Verwendete Software</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="z.B. Swiss Manager, ChessManager"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="allClocksDigital"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel required className="text-sm font-medium">
                  Alle Uhren digital
                </FormLabel>
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Telefon</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="Telefonnummer eingeben"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>E-Mail</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="E-Mail-Adresse eingeben"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Teil 2: Organisatorinformationen */}
          <span className="inline-block text-xl font-semibold text-gray-800">
            Organisatorinformationen
          </span>
          <div>
            <FormField
              control={form.control}
              name="organizerProfileId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Organisator auswählen</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Organisator auswählen" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {profiles.map((organizer) => (
                        <SelectItem
                          key={organizer.id}
                          value={organizer.id.toString()}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {organizer.lastName}, {organizer.firstName}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Teil 3: Wochen */}
          <span className="inline-block text-xl font-semibold text-gray-800">
            Spielwochen
          </span>
          <div>
            <Controller
              control={form.control}
              name="selectedCalendarWeeks"
              render={({ field }) => (
                <EditTournamentWeeks
                  weeks={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          {/* Teil 4: PGN Viewer */}
          <span className="inline-block text-xl font-semibold text-gray-800">
            Passwort für den PGN Viewer
          </span>
          <div>
            <FormField
              control={form.control}
              name="pgnViewerPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required={!tournament}>
                    PGN Viewer Passwort {tournament ? "(optional)" : ""}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={
                        tournament
                          ? "Leer lassen, um das bestehende Passwort zu behalten"
                          : "Mindestens 6 Zeichen lang"
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Nur Spieler mit diesem Passwort können alle Partien
                    anschauen.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Speichere..." : "Turnier aktualisieren"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
