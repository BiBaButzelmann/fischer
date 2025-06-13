"use server";

import { authClient } from "@/auth-client";
import z from "zod";
import { loginFormSchema } from "./login-form";
import { db } from "@/db/client";
import { redirect } from "next/navigation";
import { signupFormSchema } from "./signup-form";

export type LoginResponse = { error: string };

export async function login(data: z.infer<typeof loginFormSchema>) {
  const { data: loginData } = await authClient.signIn.email({
    email: data.email,
    password: data.password,
    rememberMe: true,
  });
  if (!loginData) {
    return {
      error: "Ungültige E-Mail-Adresse oder Passwort",
    };
  }
  const tournament = await db.query.tournament.findFirst({
    orderBy: (tournament, { desc }) => [desc(tournament.startDate)],
  });

  if (!tournament) {
    redirect("/welcome");
  }
  if (tournament.stage === "registration") {
    // tournament is not started yet -> participation form is open
    redirect("/register");
  }
  // tournament is active
  redirect("/home");
}

export type SignupResponse = { error: string };
export async function signup(data: z.infer<typeof signupFormSchema>) {
  const { data: signupData } = await authClient.signUp.email({
    name: `${data.firstName} ${data.lastName}`,
    email: data.email,
    password: data.password,
  });

  if (!signupData) {
    return {
      error: "Fehler bei der Registrierung. Bitte versuchen Sie es erneut.",
    };
  }

  redirect("/participate");
}
