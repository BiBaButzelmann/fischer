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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function DataEntryForm({
  onSubmit,
  initialData = {},
}: {
  onSubmit: (data: any) => void;
  initialData?: any;
}) {
  const form = useForm({
    defaultValues: {
      groups: initialData.groups ? String(initialData.groups) : "",
    },
  });

  function handleFormSubmit(values: any) {
    onSubmit({ groups: Number(values.groups) });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6 pt-4"
      >
        <FormField
          control={form.control}
          name="groups"
          rules={{ required: "Bitte wähle eine Anzahl." }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Anzahl der Gruppen, die du betreuen möchtest
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Anzahl auswählen" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <SelectItem key={num} value={String(num)}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
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
