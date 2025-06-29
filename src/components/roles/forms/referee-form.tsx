"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { createRefereeFormSchema } from "@/schema/referee";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { createReferee } from "@/actions/referee";
import { useTransition } from "react";
import { Calendar } from "lucide-react";
import { MatchDaysCheckboxes } from "./matchday-selection";

type Props = {
  tournamentId: number;
};
export function RefereeForm({ tournamentId }: Props) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof createRefereeFormSchema>>({
    resolver: zodResolver(createRefereeFormSchema),
    defaultValues: {
      preferredMatchDay: undefined,
      secondaryMatchDays: [],
    },
  });

  const handleFormSubmit = (data: z.infer<typeof createRefereeFormSchema>) => {
    startTransition(async () => {
      await createReferee(tournamentId, data);
      // TODO: manage accordion state etc.
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6 pt-4"
      >
        <div className="flex items-center gap-4">
          <Calendar size={20} />
          <h2 className="text-xl font-bold">Spieltage</h2>
        </div>
        <FormField
          control={form.control}
          name="preferredMatchDay"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Bevorzugter Spieltag</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wählen Sie einen Spieltag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tuesday">Dienstag</SelectItem>
                    <SelectItem value="thursday">Donnerstag</SelectItem>
                    <SelectItem value="friday">Freitag</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                Besonders für Dienstage und Freitage werden Schiedsrichter
                gesucht.
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
              <FormLabel required>
                Ich könnte zusätzlich an folgenden Wochentagen:
              </FormLabel>
              <FormControl>
                <MatchDaysCheckboxes
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
              <FormDescription>Vielen Dank!</FormDescription>
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full sm:w-auto">
          Änderungen speichern
        </Button>
      </form>
    </Form>
  );
}
