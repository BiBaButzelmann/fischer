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
import invariant from "tiny-invariant";
import { APIError } from "better-auth/api";

export async function loginRedirect(userId: string): Promise<never> {
  const tournament = await getLatestTournament();
  if (!tournament) {
    redirect("/uebersicht");
  }
  if (tournament.stage === "registration") {
    const roles = await getRolesByUserId(userId);
    if (roles.length > 0) {
      redirect("/uebersicht");
    } else {
      redirect("/klubturnier-anmeldung");
    }
  }
  throw new Error("Error during login redirect");
}

export type LoginResponse = { error: string };
export async function login(data: z.infer<typeof loginFormSchema>) {
  let userId: string;
  try {
    const result = await auth.api.signInEmail({
      body: {
        email: data.email,
        password: data.password,
        rememberMe: true,
      },
    });
    console.log("Login result:", result);
    userId = result.user.id;
  } catch (error) {
    console.error("Login error:", error);
    return {
      error:
        "Fehler bei der Anmeldung. Bitte überprüfe deine E-Mail und Passwort.",
    };
  }

  await loginRedirect(userId);
}

export async function signupRedirect() {
  const tournament = await getActiveTournament();
  if (!tournament) {
    redirect("/uebersicht");
  }
  if (tournament.stage === "registration") {
    redirect("/klubturnier-anmeldung");
  } else {
    redirect("/uebersicht");
  }
}

export type SignupResponse = { error: string };
export async function signup(data: z.infer<typeof signupFormSchema>) {
  try {
    const result = await auth.api.signUpEmail({
      body: {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        password: data.password,
      },
    });

    invariant(result, "Signup failed");

    await db.insert(profile).values({
      userId: result.user.id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber,
    });
  } catch (error) {
    console.error("Signup error:", error);

    if (error instanceof APIError) {
      if (error.message === auth.$ERROR_CODES.USER_ALREADY_EXISTS) {
        return {
          error: "Ein Benutzer mit dieser E-Mail-Adresse existiert bereits.",
        };
      }
    }

    return {
      error: "Fehler bei der Registrierung. Bitte versuche es später erneut.",
    };
  }

  await signupRedirect();
}
