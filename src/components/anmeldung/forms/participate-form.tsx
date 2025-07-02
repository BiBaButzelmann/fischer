"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Button } from "../../ui/button";
import { participantFormSchema } from "@/schema/participant";
import { MatchDaysCheckboxes } from "./matchday-selection";

type Props = {
  initialValues?: z.infer<typeof participantFormSchema>;
  onSubmit: (data: z.infer<typeof participantFormSchema>) => Promise<void>;
  onDelete: () => Promise<void>;
};

export function ParticipateForm({ initialValues, onSubmit, onDelete }: Props) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof participantFormSchema>>({
    resolver: zodResolver(participantFormSchema),
    defaultValues: {
      chessClub:
        initialValues?.chessClub ?? "Hamburger Schachklub von 1830 e.V.",
      dwzRating: initialValues?.dwzRating,
      fideRating: initialValues?.fideRating,
      fideId: initialValues?.fideId,
      preferredMatchDay: initialValues?.preferredMatchDay,
      secondaryMatchDays: initialValues?.secondaryMatchDays ?? [],
    },
  });

  const handleSubmit = (data: z.infer<typeof participantFormSchema>) => {
    startTransition(async () => {
      await onSubmit(data);
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await onDelete();
    });
  };

  const fideRating = form.watch("fideRating");
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="chessClub"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Schachverein</FormLabel>
              <FormControl>
                <Input id="chessClub" required {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="dwzRating"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>DWZ</FormLabel>
                <FormControl>
                  <Input type="number" id="dwzRating" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fideRating"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel required={fideRating ? true : false}>Elo</FormLabel>
                <FormControl>
                  <Input type="number" id="fideRating" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {fideRating ? (
          <FormField
            control={form.control}
            name="fideId"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>FIDE ID</FormLabel>
                <FormControl>
                  <Input
                    id="fideId"
                    required
                    placeholder="10245154"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}
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
                Die A-Klasse spielt nur an Freitagen
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
              <FormLabel>Ich könnte aber auch spielen am</FormLabel>
              <FormControl>
                <MatchDaysCheckboxes
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
              <FormDescription>
                Wer nicht flexibel ist, könnte unter Umständen bei dem Turnier
                nicht berücksichtigt werden.
              </FormDescription>
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
              className="w-full sm:w-auto "
              variant={"outline"}
              onClick={handleDelete}
            >
              Änderungen verwerfen
            </Button>
          ) : null}
        </div>
      </form>
    </Form>
  );
}
