import { auth } from "@/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
  const signOutResult = await auth.api.signOut({ headers: await headers() });
  if (signOutResult.success) {
    redirect("/willkommen");
  }
  redirect("/home");
}
