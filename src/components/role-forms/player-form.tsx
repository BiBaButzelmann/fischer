"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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

const weekdays = ["Dienstag", "Donnerstag", "Freitag"];

export function PlayerForm({
  onSubmit,
  initialData = {},
}: {
  onSubmit: (data: any) => void;
  initialData?: any;
}) {
  const form = useForm({
    defaultValues: {
      club: initialData.club || "Hamburger Schachverein von 1830 e.V.",
      dwz: initialData.dwz || "",
      elo: initialData.elo || "",
      fideId: initialData.fideId || "",
      preferredDay: initialData.preferredDay || "",
      otherDays: initialData.otherDays || [],
    },
  });

  const eloValue = form.watch("elo");

  function handleFormSubmit(values: any) {
    onSubmit(values);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6 pt-4"
      >
        <FormField
          control={form.control}
          name="club"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Schachverein</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dwz"
            render={({ field }) => (
              <FormItem>
                <FormLabel>DWZ</FormLabel>
                <FormControl>
                  <Input placeholder="z.B. 1850" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="elo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Elo</FormLabel>
                <FormControl>
                  <Input placeholder="z.B. 1900" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {eloValue && (
          <div className="animate-in fade-in">
            <FormField
              control={form.control}
              name="fideId"
              rules={{
                required: "Fide-ID ist erforderlich, wenn Elo angegeben ist.",
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deine Fide-ID (erforderlich)</FormLabel>
                  <FormControl>
                    <Input placeholder="Deine Fide-ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        <FormField
          control={form.control}
          name="preferredDay"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bevorzugter Spieltag</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Tag auswählen" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {weekdays.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
          <FormLabel>Ich könnte aber auch spielen am:</FormLabel>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {weekdays.map((day) => (
              <FormField
                key={day}
                control={form.control}
                name="otherDays"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(day)}
                        onCheckedChange={(checked) => {
                          return checked
                            ? field.onChange([...field.value, day])
                            : field.onChange(
                                field.value?.filter(
                                  (value: string) => value !== day,
                                ),
                              );
                        }}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">{day}</FormLabel>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </FormItem>
        <Button type="submit" className="w-full sm:w-auto">
          Änderungen speichern
        </Button>
      </form>
    </Form>
  );
}
