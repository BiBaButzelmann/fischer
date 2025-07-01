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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useTransition } from "react";
import { jurorFormSchema } from "@/schema/juror";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

type Props = {
  initiallyParticipating?: boolean;
  onSubmit: () => Promise<void>;
};

export function JurorForm({ initiallyParticipating, onSubmit }: Props) {
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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6 pt-4"
      >
        <FormField
          control={form.control}
          name="participating"
          rules={{ required: "Bitte triff eine Auswahl." }}
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Möchtest du am Turniergericht teilnehmen?</FormLabel>
              <FormControl>
                <ToggleGroup
                  type="single"
                  value={
                    field.value === true
                      ? "true"
                      : field.value === false
                        ? "false"
                        : undefined
                  }
                  onValueChange={(val) => {
                    if (val === "true") field.onChange(true);
                    else if (val === "false") field.onChange(false);
                  }}
                  className="justify-start"
                  variant="outline"
                >
                  <ToggleGroupItem value="true" aria-label="Ja">
                    Ja
                  </ToggleGroupItem>
                  <ToggleGroupItem value="false" aria-label="Nein">
                    Nein
                  </ToggleGroupItem>
                </ToggleGroup>
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
              type="submit"
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
