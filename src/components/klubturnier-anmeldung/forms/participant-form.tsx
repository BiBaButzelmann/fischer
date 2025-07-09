"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { participantFormSchema } from "@/schema/participant";
import { MatchDaysCheckboxes } from "./matchday-selection";
import { DEFAULT_CLUB } from "@/constants/constants";
import { Info, User, Users } from "lucide-react";
import { CountryDropdown } from "@/components/ui/country-dropdown";

type Props = {
  initialValues?: z.infer<typeof participantFormSchema>;
  onSubmit: (data: z.infer<typeof participantFormSchema>) => Promise<void>;
  onDelete: () => Promise<void>;
};

export function ParticipateForm({ initialValues, onSubmit, onDelete }: Props) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof participantFormSchema>>({
    resolver: zodResolver(participantFormSchema),
    defaultValues: {
      chessClub: initialValues?.chessClub ?? DEFAULT_CLUB,
      title: initialValues?.title,
      dwzRating: initialValues?.dwzRating,
      fideRating: initialValues?.fideRating,
      fideId: initialValues?.fideId,
      nationality: initialValues?.nationality,
      preferredMatchDay: initialValues?.preferredMatchDay,
      secondaryMatchDays: initialValues?.secondaryMatchDays ?? [],
    },
  });

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
  const fideRating = form.watch("fideRating");
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
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
                <strong>Zusammensetzung:</strong> Historisch gesehen haben in
                den letzten Jahren um die 100 Spieler am Klubturnier
                teilgenommen. Wir hoffen, diese Zahl in diesem Jahr zu
                übertreffen.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>
                <strong>Aufgabe:</strong> Der Spieler misst sich einmal pro
                Woche mit einem möglichst gleichstarken Gegner aus seiner Gruppe
                und versucht, bis zum Ende des Turniers den Gruppensieg zu
                erzielen. In drei Wochen hat der Spieler die Möglichkeit,
                verschobene Partien nachzuholen.
              </p>
            </div>
          </div>
        </div>
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
            name="chessClub"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel required>Schachverein</FormLabel>
                <FormControl>
                  <Input id="chessClub" required {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-4">
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
                <FormLabel required={fideRating ? true : false}>Elo</FormLabel>
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
              </FormItem>
            )}
          />
        </div>
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
