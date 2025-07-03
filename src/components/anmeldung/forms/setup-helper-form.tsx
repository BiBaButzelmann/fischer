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
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useTransition } from "react";
import { MatchDaysCheckboxes } from "./matchday-selection";
import { setupHelperFormSchema } from "@/schema/setupHelper";

type Props = {
  initialValues?: z.infer<typeof setupHelperFormSchema>;
  onSubmit: (data: z.infer<typeof setupHelperFormSchema>) => Promise<void>;
  onDelete: () => Promise<void>;
};
export function SetupHelperForm({ initialValues, onSubmit, onDelete }: Props) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof setupHelperFormSchema>>({
    resolver: zodResolver(setupHelperFormSchema),
    defaultValues: {
      preferredMatchDay: initialValues?.preferredMatchDay ?? undefined,
      secondaryMatchDays: initialValues?.secondaryMatchDays ?? [],
    },
  });

  const handleFormSubmit = (data: z.infer<typeof setupHelperFormSchema>) => {
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
