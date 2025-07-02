"use client";

import React, { ReactNode, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
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

type Props = {
  gameId: number;
  onVerify: (gameId: number, password: string) => Promise<boolean>;
  children?: ReactNode;
};

export function PasswordProtection({ gameId, onVerify, children }: Props) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<{ password: string }>({
    defaultValues: { password: "" },
  });
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(values: { password: string }) {
    setError("");
    startTransition(async () => {
      const result = await onVerify(gameId, values.password);
      if (result) {
        setVerified(true);
      } else {
        setError("Falsches Passwort");
      }
    });
  }

  if (verified) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] w-full">
      <h2 className="text-2xl font-bold mb-2 text-center">Passwort eingeben</h2>
      <p className="mb-6 text-center text-muted-foreground">
        Passwort eingeben um das Spiel ansehen zu können
      </p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="w-full max-w-xs flex flex-col items-center"
        >
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="w-full mb-4">
                <FormLabel>Passwort</FormLabel>
                <FormControl>
                  <Input type="password" autoFocus {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {error && (
            <div className="text-red-500 text-sm mb-2 w-full text-center">
              {error}
            </div>
          )}
          <Button disabled={isPending} type="submit" className="w-full">
            Ansehen
          </Button>
        </form>
      </Form>
    </div>
  );
}
