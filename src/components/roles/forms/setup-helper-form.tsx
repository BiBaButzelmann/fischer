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
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useTransition } from "react";
import { Calendar } from "lucide-react";
import { MatchDaysCheckboxes } from "./matchday-selection";
import { createSetupHelper } from "@/actions/setup-helper";
import { createSetupHelperFormSchema } from "@/schema/setupHelper";

type Props = {
  tournamentId: number;
};
export function SetupHelperForm({ tournamentId }: Props) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof createSetupHelperFormSchema>>({
    resolver: zodResolver(createSetupHelperFormSchema),
    defaultValues: {
      preferredMatchDay: undefined,
      secondaryMatchDays: [],
    },
  });

  const handleFormSubmit = (
    data: z.infer<typeof createSetupHelperFormSchema>,
  ) => {
    startTransition(async () => {
      await createSetupHelper(tournamentId, data);
      // TODO: manage accordion state etc.
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
                Bitte wähle deinen bevorzugten Spieltag als Aufbauhelfer aus.
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
                Ich könnte zusätzlich an folgenden Wochentagen aufbauen :
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
