"use server";

import { authClient } from "@/auth-client";
import z from "zod";
import { loginFormSchema } from "./login-form";
import { db } from "@/db/client";
import { redirect } from "next/navigation";

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
    where: (tournament, { gte, and }) =>
      and(gte(tournament.endDate, new Date())),
  });

  // TODO: check assumptions
  // assume if end date of tournament tournament is not active
  if (!tournament) {
    // no tournament found
    redirect("/welcome");
  }
  if (new Date() < tournament.startDate) {
    // tournament is not started yet -> participation form is open
    redirect("/participate");
  }
  // tournament is active
  redirect("/home");
}
