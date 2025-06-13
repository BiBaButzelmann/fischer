"use client";

import z from "zod";
import { Form, FormField, FormMessage } from "../ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useState, useTransition } from "react";
import { Label } from "../ui/label";
import { Mail, Lock } from "lucide-react";
import { LoginResponse } from "./actions";

export const loginFormSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
  password: z.string().min(6, "Passwort muss mindestens 6 Zeichen lang sein"),
});

export function LoginForm({
  onSubmit,
}: {
  onSubmit: (data: z.infer<typeof loginFormSchema>) => Promise<LoginResponse>;
}) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const [error, setError] = useState("");
  const handleSubmit = (data: z.infer<typeof loginFormSchema>) => {
    startTransition(async () => {
      const result = await onSubmit(data);
      //TODO: maybe redirect client side
      setError(result.error);
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email">E-Mail-Adresse</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ihre.email@beispiel.de"
                    className="pl-10"
                    required
                    {...field}
                  />
                  <FormMessage />
                </>
              )}
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password">Passwort</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Ihr Passwort"
                    className="pl-10"
                    required
                    {...field}
                  />
                  <FormMessage />
                </>
              )}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-600 text-sm text-center">{error}</div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full text-lg py-6"
          disabled={isPending}
        >
          {isPending ? "Anmelden..." : "Anmelden"}
        </Button>
      </form>
    </Form>
  );
}
