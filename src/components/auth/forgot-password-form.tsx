"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { Mail, Lock, CheckCircle } from "lucide-react";
import { authClient } from "@/auth-client";
import { forgotSchema } from "@/schema/forgotpassword";

type FormValues = z.infer<typeof forgotSchema>;

export function ForgotPasswordForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const onSubmit = async ({ email }: FormValues) => {
    setServerError("");
    setSuccessMsg("");

    const { error } = await authClient.forgetPassword({
      email,
      redirectTo: "/passwort-zuruecksetzen",
    });

    if (error) {
      setServerError(error.message ?? "Unbekannter Fehler");
      return;
    }
    setSuccessMsg(
      "Falls ein Konto mit dieser E-Mail-Adresse existiert, wurde ein Link zum Zurücksetzen des Passworts gesendet.",
    );
  };

  /* ---------- Erfolgsansicht ---------- */
  if (successMsg) {
    return (
      <div className="text-center p-4 bg-green-50 rounded-lg">
        <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
        <p className="text-green-800">{successMsg}</p>
        <Button asChild className="mt-4 w-full">
          <Link href="/anmelden">Zurück zur Anmeldung</Link>
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* E-Mail */}
        <FormField
          control={form.control}
          name="email"
          render={() => (
            <FormItem>
              <FormLabel>E-Mail-Adresse</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="deine.email@beispiel.de"
                    className="pl-10"
                    disabled={isSubmitting}
                    {...register("email")}
                  />
                </div>
              </FormControl>
              <FormMessage>{errors.email?.message}</FormMessage>
            </FormItem>
          )}
        />

        {/* Unsichtbarer Platzhalter (Layout) */}
        <div className="space-y-2 invisible" aria-hidden="true">
          <FormLabel>Password</FormLabel>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="pw-placeholder"
              type="password"
              className="pl-10"
              disabled
            />
          </div>
        </div>

        {/* Server-Fehler */}
        {serverError && (
          <div className="text-red-600 text-sm text-center">{serverError}</div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          className="w-full text-lg py-6"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Wird gesendet..." : "Passwort zurücksetzen"}
        </Button>

        {/* Link zurück zum Login */}
        <div className="mt-4 text-center">
          <Link
            href="/anmelden"
            className="text-sm text-muted-foreground hover:underline"
          >
            Zurück zur Anmeldung
          </Link>
        </div>
      </form>
    </Form>
  );
}
