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
import { refereeFormSchema } from "@/schema/referee";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useTransition } from "react";
import { MatchDaysCheckboxes } from "./matchday-selection";

type Props = {
  initialValues?: z.infer<typeof refereeFormSchema>;
  onSubmit: (data: z.infer<typeof refereeFormSchema>) => Promise<void>;
};

export function RefereeForm({ initialValues, onSubmit }: Props) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof refereeFormSchema>>({
    resolver: zodResolver(refereeFormSchema),
    defaultValues: {
      preferredMatchDay: initialValues?.preferredMatchDay ?? undefined,
      secondaryMatchDays: initialValues?.secondaryMatchDays ?? [],
    },
  });

  const handleFormSubmit = (data: z.infer<typeof refereeFormSchema>) => {
    startTransition(async () => {
      await onSubmit(data);
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6 pt-4"
      >
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
        <Button disabled={isPending} type="submit" className="w-full sm:w-auto">
          Änderungen speichern
        </Button>
      </form>
    </Form>
  );
}
