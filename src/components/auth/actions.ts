"use server";

import z from "zod";
import { loginFormSchema } from "./login-form";
import { db } from "@/db/client";
import { redirect } from "next/navigation";
import { signupFormSchema } from "./signup-form";
import { participant } from "@/db/schema/participant";
import { profile } from "@/db/schema/profile";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";

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
  const tournament = await db.query.tournament.findFirst({
    orderBy: (tournament, { desc }) => [desc(tournament.startDate)],
  });

  if (!tournament) {
    redirect("/welcome");
  }
  if (tournament.stage === "registration") {
    // tournament is not started yet -> participation form is open
    const participation = await db
      .select({ userId: profile.userId })
      .from(participant)
      .leftJoin(profile, eq(participant.profileId, profile.id))
      .where(eq(profile.userId, result.user.id));

    if (participation.length > 0) {
      redirect("/home");
    }
    redirect("/participate");
  }
  // tournament is active
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
      error: "Fehler bei der Registrierung. Bitte versuchen Sie es erneut.",
    };
  }

  await db.insert(profile).values({
    userId: result.user.id,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
  });

  // TODO: where to redirect if registration is not open?
  redirect("/participate");
}
