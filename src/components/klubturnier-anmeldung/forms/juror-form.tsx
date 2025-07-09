"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useTransition } from "react";
import { jurorFormSchema } from "@/schema/juror";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Switch } from "@/components/ui/switch";
import { Info, Users, Gavel } from "lucide-react";

type Props = {
  initiallyParticipating?: boolean;
  onSubmit: () => Promise<void>;
  onDelete: () => Promise<void>;
};

export function JurorForm({
  initiallyParticipating,
  onSubmit,
  onDelete,
}: Props) {
  console.log("initiallyParticipating", initiallyParticipating);
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof jurorFormSchema>>({
    resolver: zodResolver(jurorFormSchema),
    defaultValues: {
      participating: initiallyParticipating ?? false,
    },
  });

  const handleFormSubmit = (data: z.infer<typeof jurorFormSchema>) => {
    if (data.participating === false) {
      return;
    }
    startTransition(async () => {
      await onSubmit();
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
                <strong>Zusammensetzung:</strong> Das Turniergericht setzt sich
                aus drei Spielern des Klubturniers und zwei Nachrückern
                zusammen, die nicht als Schiedsrichter im Klubturnier tätig
                sind.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Gavel className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>
                <strong>Aufgabe:</strong> Das Turniergericht entscheidet nach
                Anhörung aller Parteien innerhalb von drei Tagen endgültig über
                den Protest einer Schiedsrichterentscheidung.
              </p>
            </div>
          </div>
        </div>
        <FormField
          control={form.control}
          name="participating"
          rules={{ required: "Bitte triff eine Auswahl." }}
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
              <FormLabel>Möchtest du am Turniergericht teilnehmen?</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
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
            Antwort speichern
          </Button>
          {initiallyParticipating !== undefined ? (
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
