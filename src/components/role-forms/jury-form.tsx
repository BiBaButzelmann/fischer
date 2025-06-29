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

export function JuryForm({
  onSubmit,
  initialData = {},
}: {
  onSubmit: (data: any) => void;
  initialData?: any;
}) {
  const getInitialValue = () => {
    if (initialData.participating === true) return "yes";
    if (initialData.participating === false) return "no";
    return "";
  };

  const form = useForm({
    defaultValues: {
      participating: getInitialValue(),
    },
  });

  function handleFormSubmit(values: any) {
    onSubmit({ participating: values.participating === "yes" });
  }

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
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="justify-start"
                  variant="outline"
                >
                  <ToggleGroupItem value="yes" aria-label="Ja">
                    Ja
                  </ToggleGroupItem>
                  <ToggleGroupItem value="no" aria-label="Nein">
                    Nein
                  </ToggleGroupItem>
                </ToggleGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full sm:w-auto">
          Antwort speichern
        </Button>
      </form>
    </Form>
  );
}
