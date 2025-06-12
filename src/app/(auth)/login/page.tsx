import { authClient } from "@/auth-client";
import { LoginForm, loginFormSchema } from "@/components/auth/login-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db/client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import z from "zod";

export default async function Page() {
  const login = async (data: z.infer<typeof loginFormSchema>) => {
    "use server";

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
    <div className="w-full max-w-md px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/welcome" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Zurück zur Startseite
          </Link>
        </Button>
      </div>

      {/* Login Card */}
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Anmelden</CardTitle>
          <p className="text-muted-foreground">
            Melden Sie sich mit Ihren Zugangsdaten an
          </p>
        </CardHeader>
        <CardContent>
          <LoginForm onSubmit={login}></LoginForm>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Noch kein Konto?{" "}
              <Link
                href="/signup"
                className="text-primary hover:underline font-medium"
              >
                Jetzt registrieren
              </Link>
            </p>
          </div>

          {/* Forgot Password */}
          <div className="mt-4 text-center">
            <Link
              href="/passwort-vergessen"
              className="text-sm text-muted-foreground hover:underline"
            >
              Passwort vergessen?
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
