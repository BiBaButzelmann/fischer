import { auth as betterAuth } from "@/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function auth() {
  const session = await betterAuth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return session;
}
