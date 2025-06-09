"use client";

import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SelectProfile } from "@/db/types/profile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateTournamentFormData,
  createTournamentFormDataSchema,
} from "./schema";
import { useTransition } from "react";
import { createTournament } from "./actions/tournament";
import { Button } from "@/components/ui/button";

type Props = {
  profiles: SelectProfile[];
};
export default function EditTournamentDetails({ profiles }: Props) {
  const [loading, startTransition] = useTransition();
  const form = useForm({
    resolver: zodResolver(createTournamentFormDataSchema),
    defaultValues: {
      clubName: "Hamburger Schachklub von 1830 e.V.",
      tournamentType: "Rundenturnier",
      numberOfRounds: 9,
      timeLimit:
        "40 Züge in 90 Minuten, danach 0 Züge in 0 Minuten, 30 Minuten für die letzte Phase, Zugabe pro Zug in Sekunden: 30",
      location: "Hamburg",
      tieBreakMethod: "Sonneborn-Berger",
      softwareUsed: "Swiss Manager",
      allClocksDigital: true,
      phone: "040 20981411",
      email: "klubturnier@hsk1830.de",
    },
  });

  const handleSubmit = async (data: CreateTournamentFormData) => {
    startTransition(async () => {
      await createTournament(data);
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
                  <FormLabel>Vereinsname</FormLabel>
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
                  <FormLabel>Turnierart *</FormLabel>
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
                  <FormLabel>Anzahl Runden *</FormLabel>
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
                  <FormLabel>Bedenkzeit *</FormLabel>
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

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Startdatum *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enddatum *</FormLabel>
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
                <FormLabel>Austragungsort *</FormLabel>
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
                  <FormLabel>Feinwertung *</FormLabel>
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
                  <FormLabel>Verwendete Software *</FormLabel>
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
                <FormLabel className="text-sm font-medium">
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
                  <FormLabel>Telefon *</FormLabel>
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
                  <FormLabel>E-Mail *</FormLabel>
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
                  <FormLabel>Organisator auswählen</FormLabel>
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
                              {organizer.name}
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
          <Button type="submit" disabled={loading}>
            Speichern
          </Button>
        </form>
      </Form>
    </div>
  );
}
