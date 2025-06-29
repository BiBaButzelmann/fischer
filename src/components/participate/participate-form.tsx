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
} from "../ui/form";
import { Calendar, Phone, Star, User, UsersRound } from "lucide-react";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { MatchDay } from "@/db/types/group";
import { createTournamentParticipant } from "@/actions/participant";
import { redirect } from "next/navigation";
import { createParticipantFormSchema } from "@/schema/participant";

type Props = {
  tournamentId: number;
  profile?: Profile;
};
export function ParticipateForm({ tournamentId, profile }: Props) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof createParticipantFormSchema>>({
    resolver: zodResolver(createParticipantFormSchema),
    defaultValues: {
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      email: profile?.email || "",
      phoneNumber: profile?.phoneNumber || "",

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
      redirect("/home");
    });
  };

  const fideRating = form.watch("fideRating");
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <section className="space-y-4">
          <div className="flex items-center gap-4">
            <User size={20} />
            <h2 className="text-xl font-bold">Persönliche Daten</h2>
          </div>
          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vorname</FormLabel>
                  <FormControl>
                    <Input id="firstName" disabled required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nachname</FormLabel>
                  <FormControl>
                    <Input id="lastName" disabled required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-Mail</FormLabel>
                <FormControl>
                  <Input id="email" disabled required {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Telefonnummer</FormLabel>
                <FormDescription>
                  Die Telefonnummer wird benötigt, um im Falle einer
                  Partieverlegung erreichbar zu sein.
                </FormDescription>
                <FormControl>
                  <Input icon={Phone} id="phoneNumber" required {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-4">
            <Star size={20} />
            <h2 className="text-xl font-bold">Schachinformationen</h2>
          </div>
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
                  <FormLabel required={fideRating ? true : false}>
                    ELO
                  </FormLabel>
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
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-4">
            <Calendar size={20} />
            <h2 className="text-xl font-bold">Spieltage</h2>
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
                <FormLabel required>Ich könnte aber auch spielen am</FormLabel>
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
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-4">
            <UsersRound size={20} />
            <h2 className="text-xl font-bold">Ich bin bereit zu helfen</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Falls Sie helfen möchten, geben Sie bitte die Wochentage an,
            ansonsten lassen Sie die Felder bitte frei. Je mehr helfen (Aufgaben
            sind auch aufteilbar), desto geringer fallen die genannten Zeiten
            für den Einzelnen aus.
          </p>
        </section>
        <Button type="submit" className="w-full" disabled={isPending}>
          Turnieranmeldung abschließen
        </Button>
      </form>
    </Form>
  );
}

function MatchDaysCheckboxes({
  value,
  onChange,
}: {
  value: MatchDay[];
  onChange: (days: MatchDay[]) => void;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex items-center flex-nowrap">
        <Checkbox
          id="tuesday"
          checked={value.includes("tuesday")}
          onCheckedChange={(checked) => {
            return checked
              ? onChange([...value, "tuesday"])
              : onChange(value.filter((value) => value !== "tuesday"));
          }}
        />
        <Label htmlFor="tuesday" className="ml-2">
          Di.
        </Label>
      </div>
      <div className="flex items-center flex-nowrap">
        <Checkbox
          id="thursday"
          onCheckedChange={(checked) => {
            return checked
              ? onChange([...value, "thursday"])
              : onChange(value.filter((value) => value !== "thursday"));
          }}
        />
        <Label htmlFor="thursday" className="ml-2">
          Do.
        </Label>
      </div>
      <div className="flex items-center flex-nowrap">
        <Checkbox
          id="friday"
          onCheckedChange={(checked) => {
            return checked
              ? onChange([...value, "friday"])
              : onChange(value.filter((value) => value !== "friday"));
          }}
        />
        <Label htmlFor="friday" className="ml-2">
          Fr.
        </Label>
      </div>
    </div>
  );
}
