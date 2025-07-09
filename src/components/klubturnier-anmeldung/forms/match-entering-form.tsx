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
import { matchEnteringHelperFormSchema } from "@/schema/matchEnteringHelper";
import { ClipboardEdit, Info, Users } from "lucide-react";

type Props = {
  initialValues?: z.infer<typeof matchEnteringHelperFormSchema>;
  onSubmit: (
    data: z.infer<typeof matchEnteringHelperFormSchema>,
  ) => Promise<void>;
  onDelete: () => Promise<void>;
};

export function MatchEnteringForm({
  initialValues,
  onSubmit,
  onDelete,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof matchEnteringHelperFormSchema>>({
    resolver: zodResolver(matchEnteringHelperFormSchema),
    defaultValues: {
      numberOfGroupsToEnter: initialValues?.numberOfGroupsToEnter ?? 1,
    },
  });

  const handleFormSubmit = (
    data: z.infer<typeof matchEnteringHelperFormSchema>,
  ) => {
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
                <strong>Zusammensetzung:</strong> Die Eingabehelfer sind im
                Durchschnitt ein Team aus bis zu 10 Personen, die sich die
                Eingabe der Schachpartien teilen. Die Zuweisung der Gruppen
                erfolgt durch die Turnierleitung. Wenn es genug Eingabehelfer
                gibt, können Gruppen auch aufgeteilt werden.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <ClipboardEdit className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>
                <strong>Aufgabe:</strong> Der Eingabehelfer gibt die ihm
                zugeteilten Partien direkt auf der Webseite in einem
                integrierten Schachbrett ein. Eine Anleitung erhält er zum
                Turnierstart zusätzlich per E-Mail.
              </p>
            </div>
          </div>
        </div>
        <FormField
          control={form.control}
          name="numberOfGroupsToEnter"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Anzahl der Gruppen</FormLabel>
              <FormControl>
                <Select
                  value={String(field.value)}
                  onValueChange={(val) => field.onChange(Number(val))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wähle die Anzahl der Gruppen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                Wähle die Anzahl der Gruppen, für die du Partien eingeben
                möchtest. Wenn möglich, weisen wir dir deine eigene Gruppe für
                die Eingabe zu.
              </FormDescription>
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
