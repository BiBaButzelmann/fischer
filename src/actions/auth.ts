"use server";

import z from "zod";
import { loginFormSchema } from "@/components/auth/login-form";
import { db } from "@/db/client";
import { redirect } from "next/navigation";
import { signupFormSchema } from "@/components/auth/signup-form";
import { profile } from "@/db/schema/profile";
import { auth } from "@/auth";
import {
  getActiveTournament,
  getLatestTournament,
} from "@/db/repositories/tournament";
import { getRolesByUserId } from "@/db/repositories/role";

export async function loginRedirect(userId: string) {
  const tournament = await getLatestTournament();
  if (!tournament) {
    redirect("/home");
  }
  if (tournament.stage === "registration") {
    const roles = await getRolesByUserId(userId);
    if (roles.length > 0) {
      redirect("/home");
    } else {
      redirect("/anmeldung");
    }
  }
}

export type LoginResponse = { error: string };
export async function login(data: z.infer<typeof loginFormSchema>) {
  const result = await auth.api.signInEmail({
    body: {
      email: data.email,
      password: data.password,
      rememberMe: true,
    },
  });
  if (!result) {
    return {
      error: "Ungültige E-Mail-Adresse oder Passwort",
    };
  }
  await loginRedirect(result.user.id);
}

export async function signupRedirect() {
  const tournament = await getActiveTournament();
  if (!tournament) {
    redirect("/home");
  }
  if (tournament.stage === "registration") {
    redirect("/anmeldung");
  } else {
    redirect("/home");
  }
}

export type SignupResponse = { error: string };
export async function signup(data: z.infer<typeof signupFormSchema>) {
  const result = await auth.api.signUpEmail({
    body: {
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      password: data.password,
    },
  });

  if (!result) {
    return {
      error: "Fehler bei der Registrierung. Bitte versuchen Sie es erneut.",
    };
  }

  await db.insert(profile).values({
    userId: result.user.id,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
  });

  await signupRedirect();
}
