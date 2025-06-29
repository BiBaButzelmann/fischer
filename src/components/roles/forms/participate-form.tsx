"use client";

import { Profile } from "@/db/types/profile";
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
import { Calendar, Star, UsersRound } from "lucide-react";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Checkbox } from "../../ui/checkbox";
import { Label } from "../../ui/label";
import { Button } from "../../ui/button";
import { MatchDay } from "@/db/types/group";
import { createTournamentParticipant } from "@/actions/participant";
import { createParticipantFormSchema } from "@/schema/participant";
import { MatchDaysCheckboxes } from "./matchday-selection";

type Props = {
  tournamentId: number;
};
export function ParticipateForm({ tournamentId }: Props) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof createParticipantFormSchema>>({
    resolver: zodResolver(createParticipantFormSchema),
    defaultValues: {
      chessClub: "Hamburger Schachklub von 1830 e.V.",
      dwzRating: undefined,
      fideRating: undefined,
      fideId: "",
      preferredMatchDay: undefined,
      secondaryMatchDays: [],
    },
  });

  const handleSubmit = (data: z.infer<typeof createParticipantFormSchema>) => {
    startTransition(async () => {
      await createTournamentParticipant(tournamentId, data);
      // TODO: manage accordion state etc.
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
        <Button type="submit" className="w-full sm:w-auto">
          Änderungen speichern
        </Button>
      </form>
    </Form>
  );
}
