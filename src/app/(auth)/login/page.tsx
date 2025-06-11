import { authClient } from "@/auth-client";
import { LoginForm, loginFormSchema } from "@/components/auth/login-form";
import { db } from "@/db/client";
import { redirect } from "next/navigation";
import z from "zod";

export default async function Page() {
  const login = async (data: z.infer<typeof loginFormSchema>) => {
    "use server";
    await authClient.signIn.email({
      email: data.email,
      password: data.password,
      rememberMe: true,
    });

    const tournament = await db.query.tournament.findFirst({
      where: (tournament, { gte, and }) =>
        and(gte(tournament.endDate, new Date())),
    });

    console.log("tournament", tournament);

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
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-center">Anmelden</h1>
      <p className="text-center my-4">Bla bla bla</p>
      <LoginForm onSubmit={login} />
    </div>
  );
}
