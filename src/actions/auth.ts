"use server";

import z from "zod";
import { loginFormSchema } from "@/components/auth/login-form";
import { db } from "@/db/client";
import { redirect } from "next/navigation";
import { signupFormSchema } from "@/components/auth/signup-form";
import { profile } from "@/db/schema/profile";
import { auth } from "@/auth";
import { getActiveTournament } from "@/db/repositories/tournament";
import { getRolesByProfileId } from "@/db/repositories/role";
import { getProfileByUserId } from "@/db/repositories/profile";
import invariant from "tiny-invariant";

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
  const tournament = await getActiveTournament();
  if (tournament?.stage === "registration") {
    const profile = await getProfileByUserId(result.user.id);
    invariant(profile, "Profile not found for user");
    const roles = await getRolesByProfileId(profile.id);

    if (roles.length > 0) {
      redirect("/home");
    }
    redirect("/anmeldung");
  }
  redirect("/home");
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
      error: "Fehler bei der Registrierung. Bitte versuche es erneut.",
    };
  }

  await db.insert(profile).values({
    userId: result.user.id,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
  });

  const tournament = await getActiveTournament();
  if (!tournament) {
    redirect("/home");
  }
  if (tournament.stage === "registration") {
    redirect("/anmeldung");
  }
  redirect("/home");
}
