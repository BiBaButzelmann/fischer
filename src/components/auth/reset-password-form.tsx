"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
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

import { Lock, CheckCircle } from "lucide-react";
import { authClient } from "@/auth-client";
import { resetSchema } from "@/schema/forgotpassword";

type FormValues = z.infer<typeof resetSchema>;

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? undefined;
  const urlError = searchParams.get("error") ?? undefined;

  const form = useForm<FormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState(urlError ?? "");

  const onSubmit = async ({ newPassword }: FormValues) => {
    if (!token) {
      setApiError("Ungültiger oder fehlender Token.");
      return;
    }

    setApiError("");
    const { error } = await authClient.resetPassword({ newPassword, token });

    if (error) {
      setApiError(error.message ?? "Unbekannter Fehler");
      return;
    }
    setSuccess(true);
  };

  /* ---------- Erfolgsansicht ---------- */
  if (success) {
    return (
      <div className="text-center p-4 bg-green-50 rounded-lg">
        <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
        <p className="text-green-800">
          Dein Passwort wurde erfolgreich geändert.
        </p>
        <Button asChild className="mt-4 w-full">
          <Link href="/anmelden">Zur Anmeldung</Link>
        </Button>
      </div>
    );
  }

  /* ---------- Formular ---------- */
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Neues Passwort */}
        <FormField
          control={form.control}
          name="newPassword"
          render={() => (
            <FormItem>
              <FormLabel>Neues Passwort</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Mind. 6 Zeichen"
                    className="pl-10"
                    disabled={isSubmitting}
                    {...register("newPassword")}
                  />
                </div>
              </FormControl>
              <FormMessage>{errors.newPassword?.message}</FormMessage>
            </FormItem>
          )}
        />

        {/* Passwort bestätigen */}
        <FormField
          control={form.control}
          name="confirmPassword"
          render={() => (
            <FormItem>
              <FormLabel>Passwort bestätigen</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Wiederholen"
                    className="pl-10"
                    disabled={isSubmitting}
                    {...register("confirmPassword")}
                  />
                </div>
              </FormControl>
              <FormMessage>{errors.confirmPassword?.message}</FormMessage>
            </FormItem>
          )}
        />

        {/* Fehleranzeige */}
        {apiError && (
          <div className="text-red-600 text-sm text-center">{apiError}</div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          className="w-full text-lg py-6"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Speichern..." : "Passwort ändern"}
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
