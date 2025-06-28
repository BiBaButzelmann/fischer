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
import { useState, useTransition } from "react";
import { Mail, Lock } from "lucide-react";
import { login } from "@/actions/auth";

export const loginFormSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
  password: z.string().min(6, "Passwort muss mindestens 6 Zeichen lang sein"),
});

export function LoginForm() {
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
      const result = await login(data);
      //TODO: maybe redirect client side
      setError(result.error);
    });
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
                  placeholder="ihre.email@beispiel.de"
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
          disabled={isPending}
        >
          {isPending ? "Anmelden..." : "Anmelden"}
        </Button>
      </form>
    </Form>
  );
}
