"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Mail, CalendarIcon, Lock, ArrowLeft } from "lucide-react";

/* RHF-Schema – gleich wie in der Action */
const profileSchema = z
  .object({
    firstName: z.string().min(1, "Pflichtfeld"),
    lastName: z.string().min(1, "Pflichtfeld"),
    email: z.string().email("Ungültige E-Mail-Adresse"),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine((d) => !d.password || d.password === d.confirmPassword, {
    message: "Passwörter stimmen nicht überein.",
    path: ["confirmPassword"],
  });

export default function EinstellungenForm({
  profile,
}: {
  profile: z.infer<typeof profileSchema>;
}) {
  const [isPending, startTransition] = useTransition();
  const [serverMsg, setServerMsg] = useState<{ ok?: string; err?: string }>({});
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: z.infer<typeof profileSchema>) => {
    setServerMsg({});
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => v && fd.append(k, v as string));

    startTransition(async () => {
      //TODO: add update logic
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Vorname */}
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vorname</FormLabel>
              <FormControl>
                <Input icon={User} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Nachname */}
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nachname</FormLabel>
              <FormControl>
                <Input icon={User} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-Mail-Adresse</FormLabel>
              <FormControl>
                <Input type="email" icon={Mail} {...field} />
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
              <FormLabel>Neues Passwort vergeben</FormLabel>
              <FormControl>
                <Input type="password" icon={Lock} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch("password") && (
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Passwort bestätigen</FormLabel>
                <FormControl>
                  <Input type="password" icon={Lock} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {serverMsg.err && (
          <p className="text-red-600 text-sm text-center">{serverMsg.err}</p>
        )}
        {serverMsg.ok && (
          <p className="text-green-600 text-sm text-center">{serverMsg.ok}</p>
        )}

        <Button
          type="submit"
          className="w-full py-6 text-lg"
          disabled={isPending}
        >
          {isPending ? "Speichern …" : "Änderungen speichern"}
        </Button>
      </form>
    </Form>
  );
}
