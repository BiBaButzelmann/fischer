"use client";

import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { authClient } from "@/auth-client";
import { Tournament } from "@/db/types/tournament";
import { Role } from "@/db/types/role";

export const loginFormSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
  password: z.string().min(6, "Passwort muss mindestens 6 Zeichen lang sein"),
});

type Props = {
  tournament?: Tournament;
  roles?: Role[];
};

export function LoginForm({ tournament, roles }: Props) {
  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const buildCallbackURL = () => {
    if (!tournament) {
      return "/uebersicht";
    }
    if (tournament.stage === "registration") {
      return roles && roles.length > 0
        ? "/uebersicht"
        : "/klubturnier-anmeldung";
    }
  };

  const handleSubmit = async (data: z.infer<typeof loginFormSchema>) => {
    setIsLoading(true);
    const result = await authClient.signIn.email({
      email: data.email,
      password: data.password,
      callbackURL: buildCallbackURL(),
      rememberMe: true,
    });
    if (result.error) {
      setError(result.error.message ?? "Fehler bei der Anmeldung");
    }
    setIsLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-Mail-Adresse</FormLabel>
              <FormControl>
                <Input
                  id="email"
                  type="email"
                  placeholder="deine.email@beispiel.de"
                  required
                  icon={Mail}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password Field */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Passwort</FormLabel>
              <FormControl>
                <Input
                  id="password"
                  type="password"
                  placeholder="Passwort eingeben"
                  required
                  icon={Lock}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Error Message */}
        {error && (
          <div className="text-red-600 text-sm text-center">{error}</div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full text-lg py-6"
          disabled={isLoading}
        >
          {isLoading ? "Anmelden..." : "Anmelden"}
        </Button>
      </form>
    </Form>
  );
}
