"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { refereeFormSchema } from "@/schema/referee";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useTransition } from "react";
import { MatchDaysCheckboxes } from "./matchday-selection";

import { Info, Shield, Users } from "lucide-react";

type Props = {
  initialValues?: z.infer<typeof refereeFormSchema>;
  onSubmit: (data: z.infer<typeof refereeFormSchema>) => Promise<void>;
  onDelete: () => Promise<void>;
};

export function RefereeForm({ initialValues, onSubmit, onDelete }: Props) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof refereeFormSchema>>({
    resolver: zodResolver(refereeFormSchema),
    defaultValues: {
      preferredMatchDay: initialValues?.preferredMatchDay ?? undefined,
      secondaryMatchDays: initialValues?.secondaryMatchDays ?? [],
      fideId: initialValues?.fideId ?? "",
    },
  });

  const handleFormSubmit = (data: z.infer<typeof refereeFormSchema>) => {
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
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6 pt-4"
      >
        <div className="border rounded-lg">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 pb-1" />
                <h3 className="font-semibold">Info</h3>
              </div>
            </div>
          </div>
          <div className="px-6 pb-6 space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Users className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>
                <strong>Zusammensetzung:</strong> Die Schiedsrichter sind in der
                diesjährigen Ausgabe für alle Wochentage geplant und machen es
                möglich, dass spielende Gruppen Elo ausgewertet werden können.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>
                <strong>Aufgabe:</strong> Jeder Schiedsrichter ist für einen
                Wochentag eingeteilt, an dem er den Spieltag betreut und die
                Ergebnisse auf der Webseite einträgt. Dazu wird eine Anleitung
                zum Turnierstart per E-Mail verschickt.
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="preferredMatchDay"
            render={({ field }) => (
              <FormItem className="flex-1">
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
                <FormMessage />
              </FormItem>
            )}
          />
          {/* FIDE-ID */}
          <FormField
            control={form.control}
            name="fideId"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel required>FIDE ID</FormLabel>
                <FormControl>
                  <Input
                    id="fideId"
                    required
                    placeholder="10245154"
                    {...field}
                  />
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
        </div>
        <FormField
          control={form.control}
          name="secondaryMatchDays"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Ich könnte zusätzlich an folgenden Wochentagen:
              </FormLabel>
              <FormControl>
                <MatchDaysCheckboxes
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
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
              onClick={handleDelete}
              className="w-full sm:w-auto "
              variant={"outline"}
            >
              Änderungen verwerfen
            </Button>
          ) : null}
        </div>
      </form>
    </Form>
  );
}
