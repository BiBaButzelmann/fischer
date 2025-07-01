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
import { Switch } from "@/components/ui/switch";

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
