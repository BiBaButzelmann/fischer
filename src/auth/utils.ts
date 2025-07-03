import { auth as betterAuth } from "@/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function authWithRedirect() {
  const session = await auth();

  if (!session) {
    redirect("/willkommen");
  }

  return session;
}

export async function auth() {
  const session = await betterAuth.api.getSession({
    headers: await headers(),
  });
  return session;
}
