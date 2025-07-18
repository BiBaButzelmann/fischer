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

import { Info, Users, Wrench } from "lucide-react";

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

  const preferredMatchDay = form.watch("preferredMatchDay");

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
                <strong>Zusammensetzung:</strong> Die Aufbauhelfer sind in der
                Regel eine Gruppe von mindestens 6 Personen, die sich auf die
                Spieltage aufteilen
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Wrench className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>
                <strong>Aufgabe:</strong> Jeder Aufbauhelfer ist in der Regel
                für den Aufbau der Schachbretter und das Stellen der Uhren eines
                Spieltages verantwortlich. Die Aufbauhelfer werden nach
                Möglichkeit gleichmäßig auf die Tage aufgeteilt, sodass sie sich
                abwechseln können.
              </p>
            </div>
          </div>
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
                Ich könnte zusätzlich an folgenden Spieltagen aufbauen :
              </FormLabel>
              <FormControl>
                <MatchDaysCheckboxes
                  value={field.value}
                  onChange={field.onChange}
                  preferredMatchDay={preferredMatchDay}
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
