"use client";

import z from "zod";
import { useState, useTransition } from "react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "../ui/form";
import { Input } from "../ui/input";
import { PasswordInput } from "@daveyplate/better-auth-ui";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signup } from "@/actions/auth";
import { Mail, User, Lock, Phone } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import Link from "next/link";

export const signupFormSchema = z
  .object({
    firstName: z.string().min(1, "Vorname ist erforderlich"),
    lastName: z.string().min(1, "Nachname ist erforderlich"),
    email: z.string().email("Ungültige E-Mail-Adresse"),
    phoneNumber: z.string().min(1, "Telefonnummer ist erforderlich"),
    password: z.string().min(6, "Passwort muss mindestens 6 Zeichen lang sein"),
    confirmPassword: z.string(),
    acceptedTerms: z.literal<boolean>(true, {
      errorMap: () => ({
        message: "Sie müssen den Datenschutzbestimmungen zustimmen",
      }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwörter stimmen nicht überein",
    path: ["confirmPassword"],
  });

export function SignupForm() {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof signupFormSchema>>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = (data: z.infer<typeof signupFormSchema>) => {
    startTransition(async () => {
      const result = await signup(data);
      setError(result?.error ?? "");
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Vorname</FormLabel>
                <FormControl>
                  <Input
                    id="firstName"
                    placeholder="Max"
                    icon={User}
                    {...field}
                  />
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
                <FormLabel required>Nachname</FormLabel>
                <FormControl>
                  <Input id="lastName" placeholder="Mustermann" {...field} />
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
              <FormLabel required>E-Mail-Adresse</FormLabel>
              <FormControl>
                <Input
                  id="email"
                  type="email"
                  placeholder="max.mustermann@beispiel.de"
                  icon={Mail}
                  {...field}
                />
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
              <FormControl>
                <Input
                  type="tel"
                  placeholder="+49 123 4567890"
                  icon={Phone}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Passwort</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground z-10"
                  />
                  <PasswordInput
                    id="password"
                    placeholder="Passwort muss mindestens 6 Zeichen lang sein"
                    className="pl-10"
                    enableToggle={true}
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Passwort bestätigen</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground z-10"
                  />
                  <PasswordInput
                    id="confirmPassword"
                    placeholder="Passwort wiederholen"
                    className="pl-10"
                    enableToggle={true}
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="acceptedTerms"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Datenschutz</FormLabel>
              <FormControl>
                <div className="flex items-start gap-1.5 text-muted-foreground">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-1"
                  />
                  <p>
                    Ich stimme zu, dass meine Daten elektronisch erhoben und für
                    die Dauer des Turniers gespeichert werden. Ich bin
                    desweiteren damit einverstanden, dass ich dauerhaft als
                    Teilnehmer des Turniers auf der HSK-Website genannt werden
                    kann.
                    <br></br>
                    Ich bestätigte, die{" "}
                    <Link
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://hsk1830.de/Datenschutz"
                      className="text-primary"
                    >
                      Datenschutzerklärung
                    </Link>{" "}
                    zur Kenntnis genommen zu haben.
                    <br></br>
                    Hinweis: Du kannst deine Einwilligung jederzeit per E-Mail
                    an{" "}
                    <Link
                      href="mailto:datenschutz@hsk1830.de"
                      className="text-primary"
                    >
                      datenschutz@hsk1830.de
                    </Link>{" "}
                    widerrufen.
                  </p>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <div className="text-red-600 text-sm text-center">{error}</div>
        )}

        <Button
          type="submit"
          className="w-full text-lg py-6"
          disabled={isPending}
        >
          {isPending ? "Registrierung läuft..." : "Konto erstellen"}
        </Button>
      </form>
    </Form>
  );
}
