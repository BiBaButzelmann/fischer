"use client";

import { useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { updateProfile } from "@/actions/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { updateUserName } from "@/actions/user";

const formSchema = z.object({
  firstName: z.string().min(1, {
    message: "Vorname ist erforderlich",
  }),
  lastName: z.string().min(1, {
    message: "Nachname ist erforderlich",
  }),
});

export function ChangeNameCard({
  firstName: initialFirstName,
  lastName: initialLastName,
}: {
  firstName: string;
  lastName: string;
}) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: initialFirstName || "",
      lastName: initialLastName || "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      await Promise.all([
        updateProfile({
          firstName: values.firstName,
          lastName: values.lastName,
        }),
        updateUserName(values.firstName, values.lastName),
      ]);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-semibold text-lg md:text-xl">
          Dein Name
        </CardTitle>
        <CardDescription>
          Aktualisiere deinen Namen für dein Profil. Dieser Name wird für die
          DWZ-Auswertung verwendet. Wenn der Name nicht stimmt, kannst du ggf.
          nicht für das Turnier berücksichtigt werden.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="px-6">
            <div className="flex items-center gap-6 w-full">
              <div className="flex-grow">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Vorname" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex-grow">
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Nachname" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="items-center px-6 [.border-t]:pt-6 flex flex-col justify-between gap-4 rounded-b-xl md:flex-row !py-4 border-t bg-sidebar">
            <p className="text-center text-muted-foreground text-xs md:text-start md:text-sm">
              Mit Speichern bestätigst du die Änderung deines Namens.
            </p>
            <Button
              size="default"
              type="submit"
              disabled={isPending}
              className="h-8"
            >
              Speichern
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
