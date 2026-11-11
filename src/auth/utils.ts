import { cache } from "react";
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

// Multiple server components read the session during one render. React cache
// deduplicates those calls, and cookieCache avoids the database on a miss.
export const auth = cache(async () => {
  const session = await betterAuth.api.getSession({
    headers: await headers(),
  });
  return session;
});
